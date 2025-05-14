import puppeteer, { Browser, Page } from 'puppeteer';
import ytdlp from 'yt-dlp-exec';
import path from 'path';
import fs from 'fs';
import { mkdir } from 'fs/promises';
import Video, { IVideo } from '../models/Video';
import Performer, { IPerformer } from '../models/Performer';
import { StreamDetectorService } from './StreamDetectorService';

interface StreamMetadata {
  performerName: string;
  timestamp: string;
  thumbnailUrl?: string;
  streamUrl: string;
}

export class RecorderEngine {
  private browser: Browser | null = null;
  private recordingsDir: string;
  private thumbnailsDir: string;

  constructor(
    private streamDetector: StreamDetectorService,
    recordingsDir: string = path.join(process.cwd(), 'recordings'),
    thumbnailsDir: string = path.join(process.cwd(), 'public', 'thumbnails')
  ) {
    this.recordingsDir = recordingsDir;
    this.thumbnailsDir = thumbnailsDir;
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Ensure directories exist
    await mkdir(this.recordingsDir, { recursive: true });
    await mkdir(this.thumbnailsDir, { recursive: true });
  }

  async detectAndRecord(url: string): Promise<IVideo | null> {
    if (!this.browser) {
      throw new Error('RecorderEngine not initialized. Call initialize() first.');
    }

    const page = await this.browser.newPage();
    try {
      // Listen for network requests
      const streamUrl = await this.detectStreamUrl(page, url);
      if (!streamUrl) {
        console.log('No stream detected');
        return null;
      }

      // Extract metadata
      const metadata = await this.extractMetadata(page, url);
      if (!metadata) {
        console.log('Failed to extract metadata');
        return null;
      }

      // Download stream
      const outputPath = await this.downloadStream(streamUrl, metadata);
      if (!outputPath) {
        console.log('Failed to download stream');
        return null;
      }

      // Download thumbnail if available
      let thumbnailPath: string | undefined;
      if (metadata.thumbnailUrl) {
        thumbnailPath = await this.downloadThumbnail(metadata.thumbnailUrl, metadata.performerName);
      }

      // Create video entry
      const video = await this.createVideoEntry(metadata, outputPath, thumbnailPath);
      return video;
    } finally {
      await page.close();
    }
  }

  private async detectStreamUrl(page: Page, url: string): Promise<string | null> {
    let streamUrl: string | null = null;

    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('.m3u8')) {
        streamUrl = url;
      }
    });

    await page.goto(url, { waitUntil: 'networkidle0' });
    return streamUrl;
  }

  private async extractMetadata(page: Page, url: string): Promise<StreamMetadata | null> {
    try {
      const performerName = await page.evaluate(() => {
        // Try to get performer name from various sources
        const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
        const title = document.title;
        return ogTitle || title;
      });

      const thumbnailUrl = await page.evaluate(() => {
        const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
        return ogImage || undefined;
      });

      return {
        performerName,
        timestamp: new Date().toISOString(),
        thumbnailUrl,
        streamUrl: url
      };
    } catch (error) {
      console.error('Error extracting metadata:', error);
      return null;
    }
  }

  private async downloadStream(streamUrl: string, metadata: StreamMetadata): Promise<string | null> {
    try {
      const timestamp = new Date(metadata.timestamp).toISOString().replace(/[:.]/g, '-');
      const filename = `${metadata.performerName}_${timestamp}.mp4`;
      const outputPath = path.join(this.recordingsDir, filename);

      await ytdlp(streamUrl, {
        output: outputPath,
        format: 'best',
        mergeOutputFormat: 'mp4'
      });

      return outputPath;
    } catch (error) {
      console.error('Error downloading stream:', error);
      return null;
    }
  }

  private async downloadThumbnail(thumbnailUrl: string, performerName: string): Promise<string | undefined> {
    try {
      const response = await fetch(thumbnailUrl);
      if (!response.ok) return undefined;

      const buffer = await response.arrayBuffer();
      const filename = `${performerName}_${Date.now()}.jpg`;
      const filepath = path.join(this.thumbnailsDir, filename);

      await fs.promises.writeFile(filepath, Buffer.from(buffer));
      return `/thumbnails/${filename}`;
    } catch (error) {
      console.error('Error downloading thumbnail:', error);
      return undefined;
    }
  }

  private async createVideoEntry(
    metadata: StreamMetadata,
    filePath: string,
    thumbnailPath?: string
  ): Promise<IVideo> {
    // Find or create performer
    let performer = await Performer.findOne({ name: metadata.performerName });
    if (!performer) {
      performer = await Performer.create({
        name: metadata.performerName,
        platforms: [{
          platform: 'Other',
          channelId: metadata.performerName,
          url: metadata.streamUrl
        }],
        isActive: true
      });
    }

    // Create video entry
    const video = await Video.create({
      title: `${metadata.performerName} - ${new Date(metadata.timestamp).toLocaleString()}`,
      fileUrl: filePath,
      thumbnail: thumbnailPath,
      platform: 'Other',
      performerId: performer._id,
      uploadedBy: performer._id,
      recordedAt: new Date(metadata.timestamp),
      isPublic: true
    });

    return video;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
} 