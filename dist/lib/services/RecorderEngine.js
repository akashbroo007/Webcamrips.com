"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecorderEngine = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const yt_dlp_exec_1 = __importDefault(require("yt-dlp-exec"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const promises_1 = require("fs/promises");
const Video_1 = __importDefault(require("../models/Video"));
const Performer_1 = __importDefault(require("../models/Performer"));
class RecorderEngine {
    constructor(streamDetector, recordingsDir = path_1.default.join(process.cwd(), 'recordings'), thumbnailsDir = path_1.default.join(process.cwd(), 'public', 'thumbnails')) {
        this.streamDetector = streamDetector;
        this.browser = null;
        this.recordingsDir = recordingsDir;
        this.thumbnailsDir = thumbnailsDir;
    }
    async initialize() {
        this.browser = await puppeteer_1.default.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        // Ensure directories exist
        await (0, promises_1.mkdir)(this.recordingsDir, { recursive: true });
        await (0, promises_1.mkdir)(this.thumbnailsDir, { recursive: true });
    }
    async detectAndRecord(url) {
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
            let thumbnailPath;
            if (metadata.thumbnailUrl) {
                thumbnailPath = await this.downloadThumbnail(metadata.thumbnailUrl, metadata.performerName);
            }
            // Create video entry
            const video = await this.createVideoEntry(metadata, outputPath, thumbnailPath);
            return video;
        }
        finally {
            await page.close();
        }
    }
    async detectStreamUrl(page, url) {
        let streamUrl = null;
        page.on('response', async (response) => {
            const url = response.url();
            if (url.includes('.m3u8')) {
                streamUrl = url;
            }
        });
        await page.goto(url, { waitUntil: 'networkidle0' });
        return streamUrl;
    }
    async extractMetadata(page, url) {
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
        }
        catch (error) {
            console.error('Error extracting metadata:', error);
            return null;
        }
    }
    async downloadStream(streamUrl, metadata) {
        try {
            const timestamp = new Date(metadata.timestamp).toISOString().replace(/[:.]/g, '-');
            const filename = `${metadata.performerName}_${timestamp}.mp4`;
            const outputPath = path_1.default.join(this.recordingsDir, filename);
            await (0, yt_dlp_exec_1.default)(streamUrl, {
                output: outputPath,
                format: 'best',
                mergeOutputFormat: 'mp4'
            });
            return outputPath;
        }
        catch (error) {
            console.error('Error downloading stream:', error);
            return null;
        }
    }
    async downloadThumbnail(thumbnailUrl, performerName) {
        try {
            const response = await fetch(thumbnailUrl);
            if (!response.ok)
                return undefined;
            const buffer = await response.arrayBuffer();
            const filename = `${performerName}_${Date.now()}.jpg`;
            const filepath = path_1.default.join(this.thumbnailsDir, filename);
            await fs_1.default.promises.writeFile(filepath, Buffer.from(buffer));
            return `/thumbnails/${filename}`;
        }
        catch (error) {
            console.error('Error downloading thumbnail:', error);
            return undefined;
        }
    }
    async createVideoEntry(metadata, filePath, thumbnailPath) {
        // Find or create performer
        let performer = await Performer_1.default.findOne({ name: metadata.performerName });
        if (!performer) {
            performer = await Performer_1.default.create({
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
        const video = await Video_1.default.create({
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
exports.RecorderEngine = RecorderEngine;
