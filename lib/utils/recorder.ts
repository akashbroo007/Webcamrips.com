import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import { logger, recordingLogger } from './logger';
import appConfig from '@/config/app';
import platforms, { PlatformConfig } from '@/config/platforms';
import { delay } from './helpers';

/**
 * Process output handler function
 */
export type ProcessOutputHandler = (data: string) => void;

/**
 * Result of a recording process
 */
export interface RecordingProcessResult {
  success: boolean;
  duration?: number;  // Duration in seconds
  fileSize?: number;  // File size in bytes
  outputPath?: string;
  error?: Error;
}

/**
 * Recording options
 */
export interface RecordingOptions {
  platform: string;
  streamUrl: string;
  outputPath: string;
  maxDuration?: number;  // Duration in minutes
  quality?: string;
  userAgent?: string;
  cookies?: boolean;
  onStdout?: ProcessOutputHandler;
  onStderr?: ProcessOutputHandler;
  onExit?: (code: number | null) => void;
}

/**
 * Class for handling recording processes
 */
export class RecordingProcess {
  private process: ChildProcess | null = null;
  private outputPath: string;
  private started: Date = new Date();
  private maxDurationTimer: NodeJS.Timeout | null = null;
  private forceKilled: boolean = false;
  private processClosed: boolean = false;
  private recordingOptions: RecordingOptions;

  constructor(options: RecordingOptions) {
    this.outputPath = options.outputPath;
    this.recordingOptions = options;
  }

  /**
   * Start the recording process using yt-dlp
   */
  async startWithYtdlp(): Promise<ChildProcess> {
    const {
      platform,
      streamUrl,
      outputPath,
      quality = 'best',
      userAgent,
      cookies,
      onStdout,
      onStderr
    } = this.recordingOptions;
    
    // Get platform-specific configuration
    const platformConfig = platforms[platform] || {} as PlatformConfig;
    
    // Build arguments for yt-dlp
    const args: string[] = [
      streamUrl,
      '--no-playlist',
      '--format', quality,
      '-o', outputPath
    ];
    
    // Add platform-specific flags
    if (platformConfig.ytdlpFlags) {
      args.push(...platformConfig.ytdlpFlags);
    }
    
    // Add user agent if provided
    if (userAgent || platformConfig.userAgent) {
      args.push('--user-agent', userAgent || platformConfig.userAgent!);
    }
    
    // Add cookies if enabled
    if (cookies || platformConfig.cookies) {
      // Check if we have a Chrome cookies path
      if (appConfig.cookies.chrome) {
        args.push('--cookies-from-browser', `chrome:${appConfig.cookies.chrome}`);
      } else if (appConfig.cookies.firefox) {
        args.push('--cookies-from-browser', `firefox:${appConfig.cookies.firefox}`);
      } else {
        args.push('--cookies-from-browser', 'chrome');
      }
    }
    
    // Log the command
    recordingLogger.info(`Starting yt-dlp with: yt-dlp ${args.join(' ')}`);
    
    // Start the process
    const process = spawn('yt-dlp', args);
    this.process = process;
    
    // Set up output handlers
    process.stdout.on('data', (data) => {
      const output = data.toString();
      if (onStdout) onStdout(output);
      recordingLogger.debug(`[yt-dlp] stdout: ${output.trim()}`);
    });
    
    process.stderr.on('data', (data) => {
      const output = data.toString();
      if (onStderr) onStderr(output);
      recordingLogger.debug(`[yt-dlp] stderr: ${output.trim()}`);
    });
    
    // Set up error handler
    process.on('error', (error) => {
      recordingLogger.error(`yt-dlp process error: ${error.message}`);
    });
    
    return process;
  }
  
  /**
   * Start the recording process using streamlink as a fallback
   */
  async startWithStreamlink(): Promise<ChildProcess> {
    const {
      platform,
      streamUrl,
      outputPath,
      quality = 'best',
      userAgent,
      onStdout,
      onStderr
    } = this.recordingOptions;
    
    // Get platform-specific configuration
    const platformConfig = platforms[platform] || {} as PlatformConfig;
    
    // Build arguments for streamlink
    const args: string[] = [
      streamUrl,
      quality,
      '-o', outputPath,
      '--force'
    ];
    
    // Add platform-specific flags
    if (platformConfig.streamlinkFlags) {
      args.push(...platformConfig.streamlinkFlags);
    }
    
    // Log the command
    recordingLogger.info(`Starting streamlink with: streamlink ${args.join(' ')}`);
    
    // Start the process
    const process = spawn('streamlink', args);
    this.process = process;
    
    // Set up output handlers
    process.stdout.on('data', (data) => {
      const output = data.toString();
      if (onStdout) onStdout(output);
      recordingLogger.debug(`[streamlink] stdout: ${output.trim()}`);
    });
    
    process.stderr.on('data', (data) => {
      const output = data.toString();
      if (onStderr) onStderr(output);
      recordingLogger.debug(`[streamlink] stderr: ${output.trim()}`);
    });
    
    // Set up error handler
    process.on('error', (error) => {
      recordingLogger.error(`streamlink process error: ${error.message}`);
    });
    
    return process;
  }
  
  /**
   * Start the recording
   */
  async start(): Promise<void> {
    const { maxDuration, onExit } = this.recordingOptions;
    
    try {
      // First try yt-dlp
      if (appConfig.recording.useYtdlp) {
        try {
          this.process = await this.startWithYtdlp();
        } catch (error) {
          recordingLogger.error(`yt-dlp failed, falling back to streamlink: ${error}`);
          
          // If yt-dlp fails and streamlink is enabled, try that
          if (appConfig.recording.useStreamlink) {
            this.process = await this.startWithStreamlink();
          } else {
            throw error;
          }
        }
      } else if (appConfig.recording.useStreamlink) {
        // If yt-dlp is disabled, try streamlink directly
        this.process = await this.startWithStreamlink();
      } else {
        throw new Error('No recording method enabled');
      }
      
      // Set up close handler
      this.process.on('close', (code) => {
        this.processClosed = true;
        
        // Clear max duration timer if it exists
        if (this.maxDurationTimer) {
          clearTimeout(this.maxDurationTimer);
          this.maxDurationTimer = null;
        }
        
        recordingLogger.info(`Recording process exited with code ${code}`);
        
        // Call the onExit callback if provided
        if (onExit) onExit(code);
      });
      
      // Set max duration timer if provided
      if (maxDuration) {
        const durationMs = maxDuration * 60 * 1000; // Convert to milliseconds
        this.maxDurationTimer = setTimeout(() => {
          recordingLogger.info(`Max duration of ${maxDuration} minutes reached, stopping recording`);
          this.stop();
        }, durationMs);
      }
      
      // Mark as started
      this.started = new Date();
    } catch (error: any) {
      recordingLogger.error(`Failed to start recording: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Stop the recording
   */
  async stop(): Promise<void> {
    if (!this.process || this.processClosed) {
      return;
    }
    
    // Mark as force killed
    this.forceKilled = true;
    
    // Send SIGTERM to the process
    this.process.kill('SIGTERM');
    
    // Give it a moment to shut down gracefully
    await delay(1000);
    
    // If it's still running, force kill it
    if (!this.processClosed) {
      this.process.kill('SIGKILL');
    }
  }
  
  /**
   * Get the result of the recording
   */
  getResult(): RecordingProcessResult {
    // Check if the output file exists
    const fileExists = fs.existsSync(this.outputPath);
    const partFileExists = fs.existsSync(`${this.outputPath}.part`);
    
    // If the file doesn't exist but the part file does, try to rename it
    if (!fileExists && partFileExists) {
      try {
        fs.renameSync(`${this.outputPath}.part`, this.outputPath);
        recordingLogger.info(`Renamed .part file to ${this.outputPath}`);
      } catch (error) {
        recordingLogger.error(`Failed to rename .part file: ${error}`);
      }
    }
    
    // Check the file again after potential rename
    const finalFileExists = fs.existsSync(this.outputPath);
    
    if (finalFileExists) {
      // Get file stats
      const stats = fs.statSync(this.outputPath);
      const fileSize = stats.size;
      
      // Calculate approximate duration based on start and end time
      const endTime = new Date();
      const durationSeconds = Math.floor((endTime.getTime() - this.started.getTime()) / 1000);
      
      return {
        success: true,
        fileSize,
        duration: durationSeconds,
        outputPath: this.outputPath
      };
    } else {
      // Return error if no file was produced
      return {
        success: false,
        error: new Error('No output file was produced')
      };
    }
  }
  
  /**
   * Check if the recording is still active
   */
  isActive(): boolean {
    return !this.processClosed && this.process !== null;
  }
}

/**
 * Create and start a new recording
 */
export async function startRecording(options: RecordingOptions): Promise<RecordingProcess> {
  const recordingProcess = new RecordingProcess(options);
  await recordingProcess.start();
  return recordingProcess;
} 