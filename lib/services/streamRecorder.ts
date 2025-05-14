import { spawn } from 'child_process';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';

export interface RecordingOptions {
  quality?: string;
  duration?: number;
  cookiePath?: string;
}

export interface RecordingResult {
  success: boolean;
  filePath: string;
  fileSize?: number;
  duration?: number;
  error?: string;
  _id?: string;
}

class StreamRecorder {
  private outputDir: string;

  constructor(outputDir: string = 'recordings') {
    this.outputDir = outputDir;
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
    options: RecordingOptions = {}
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
              _id: timestamp
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

  async startRecording(options: {
    streamUrl: string;
    platform: string;
    modelName?: string;
    performer?: any;
    channelId?: string;
    maxDuration?: number;
    quality?: string;
    cookiePath?: string;
  }): Promise<RecordingResult> {
    const modelName = options.modelName || options.performer?.name || 'unknown';
    const duration = options.maxDuration;

    return this.recordStream(
      options.streamUrl,
      options.platform,
      modelName,
      {
        quality: options.quality,
        duration,
        cookiePath: options.cookiePath
      }
    );
  }

  async stopRecording(recordingId: string): Promise<RecordingResult | null> {
    // TODO: Implement stop recording functionality
    return null;
  }
}

const streamRecorder = new StreamRecorder();
export default streamRecorder;