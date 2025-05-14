import { spawn } from 'child_process';
import { logger } from '../../lib/utils/logger';
import path from 'path';
import fs from 'fs';

export interface RecordingResult {
  success: boolean;
  filePath: string;
  fileSize?: number;
  duration?: number;
  method?: string;
  error?: string;
}

export interface DownloaderOptions {
  outputDir?: string;
  preferredMethod?: 'yt-dlp' | 'ffmpeg' | 'streamlink';
}

export class Downloader {
  private outputDir: string;
  private preferredMethod: string;

  constructor(options: DownloaderOptions = {}) {
    this.outputDir = options.outputDir || 'recordings';
    this.preferredMethod = options.preferredMethod || 'yt-dlp';
    this.ensureOutputDirectory();
  }

  private ensureOutputDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async recordStream(
    streamUrl: string,
    platform: string,
    modelName: string,
    options: { quality?: string; duration?: number; cookiePath?: string } = {}
  ): Promise<RecordingResult> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputFilename = `${platform}_${modelName}_${timestamp}.mp4`;
      const outputPath = path.join(this.outputDir, outputFilename);

      const ytdlpArgs = [
        streamUrl,
        '-o', outputPath,
        '--format', options.quality || 'best',
        '--no-part',
        '--hls-use-mpegts',
        '--get-duration'
      ];

      if (options.duration) {
        ytdlpArgs.push('--max-filesize', `${options.duration}s`);
      }

      if (options.cookiePath) {
        ytdlpArgs.push('--cookies', options.cookiePath);
      }

      const ytdlp = spawn('yt-dlp', ytdlpArgs);

      return new Promise((resolve) => {
        let duration: number | undefined;
        
        ytdlp.stdout.on('data', (data) => {
          const durationStr = data.toString().trim();
          if (durationStr) {
            duration = parseFloat(durationStr);
          }
        });

        ytdlp.on('close', async (code) => {
          if (code === 0) {
            const stats = await fs.promises.stat(outputPath);
            resolve({
              success: true,
              filePath: outputPath,
              fileSize: stats.size,
              duration,
              method: this.preferredMethod
            });
          } else {
            resolve({
              success: false,
              filePath: outputPath,
              error: `yt-dlp exited with code ${code}`
            });
          }
        });

        ytdlp.stderr.on('data', (data) => {
          logger.error(`yt-dlp error: ${data}`);
        });
      });
    } catch (error) {
      logger.error('Error recording stream:', error);
      return {
        success: false,
        filePath: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
} 