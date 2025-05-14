import dotenv from 'dotenv';
// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';

// Internal imports
import { logger } from '../lib/utils/logger';
import { generateThumbnails, getVideoMetadata as ffmpegGetVideoMetadata } from '../lib/utils/ffmpeg';
import { StreamDetectorService } from '../lib/services/StreamDetectorService';
import { ensureDirectoryExists as ensureDirExists } from '../lib/utils/paths';
import fileHostService from '../lib/services/FileHostService';

const execPromise = promisify(exec);

// Configure output directories with platform-independent path handling
const RECORDINGS_DIR = path.join(process.cwd(), 'recordings', 'direct');
const THUMBNAILS_DIR = path.join(process.cwd(), 'public', 'thumbnails');

// Use the imported function instead of redefining
// Create all necessary directories recursively to ensure they exist
// Ensure directories exist before starting
[RECORDINGS_DIR, THUMBNAILS_DIR].forEach(ensureDirExists);

// Supported video file extensions to check
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mkv', '.ts', '.flv'];

interface RecordingResult {
  success: boolean;
  filePath: string;
  fileSize?: number;
  duration?: number;
  resolution?: string;
  isPart?: boolean;
}

/**
 * Extract video metadata using FFmpeg
 */
async function getVideoMetadata(filePath: string): Promise<any> {
  try {
    // Use ffprobe to get video metadata in JSON format
    const { stdout } = await execPromise(
      `ffprobe -v error -show_entries format=duration -show_entries stream=width,height -of json "${filePath}"`
    );
    
    const metadata = JSON.parse(stdout);
    
    // Extract relevant information
    const streams = metadata.streams || [];
    const videoStream = streams.find((s: any) => s.width && s.height);
    const format = metadata.format || {};
    
    return {
      duration: format.duration ? parseFloat(format.duration) : undefined,
      width: videoStream?.width,
      height: videoStream?.height,
      resolution: videoStream ? `${videoStream.width}x${videoStream.height}` : undefined
    };
  } catch (error) {
    console.log(`⚠️ Could not extract metadata: ${error}`);
    return {};
  }
}

/**
 * Check if a file exists with any of the given extensions
 */
function findFileWithExtensions(basePath: string, extensions: string[]): string | null {
  const directory = path.dirname(basePath);
  const baseFilename = path.basename(basePath, path.extname(basePath));
  
  // Check if exact file exists first
  if (fs.existsSync(basePath)) {
    return basePath;
  }
  
  // Try all extensions
  for (const ext of extensions) {
    const filePath = path.join(directory, `${baseFilename}${ext}`);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  
  // Check for .part files
  for (const ext of extensions) {
    const partFilePath = path.join(directory, `${baseFilename}${ext}.part`);
    if (fs.existsSync(partFilePath)) {
      return partFilePath;
    }
  }
  
  return null;
}

/**
 * Record a stream using yt-dlp with enhanced error handling and fallbacks
 */
async function recordStream(
  streamUrl: string, 
  outputName: string, 
  duration: number = 60
): Promise<RecordingResult> {
  const startTime = new Date();
  console.log(`🕒 Recording started at: ${startTime.toISOString()}`);
  
  // Create a timestamped filename
  const timestamp = startTime.toISOString().replace(/:/g, '-');
  const outputFilename = `${outputName}-${timestamp}.mp4`;
  const outputPath = path.join(RECORDINGS_DIR, outputFilename);
  
  console.log(`📹 Starting recording of ${streamUrl} for ${duration} seconds...`);
  console.log(`💾 Output file will be saved to: ${outputPath}`);
  
  // Format arguments for yt-dlp with improved format selection and frame handling
  const args = [
    streamUrl,
    // Better format selection to avoid the warning
    '-f', 'bestvideo+bestaudio/best',
    // Properly quote and escape the output path
    '-o', outputPath.replace(/\\/g, '/'),
    // Don't create .part files
    '--no-part',
    // Don't try to download playlists
    '--no-playlist',
    // Add a user agent to avoid blocking
    '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    // Continue on download errors
    '--ignore-errors',
    // Show all output for debugging
    '--verbose',
    // Add buffer size to prevent frame drops
    '--buffer-size', '16M',
    // Add retry attempts
    '--retries', '10',
    // Add timeout
    '--socket-timeout', '30',
    // Add read timeout
    '--read-timeout', '30',
    // Add write timeout
    '--write-timeout', '30',
    // Add connection timeout
    '--connect-timeout', '30',
    // Add download timeout
    '--download-timeout', '30',
    // Add fragment retries
    '--fragment-retries', '10',
    // Add retry sleep
    '--retry-sleep', 'exp=1:10',
    // Add hls prefer native
    '--hls-prefer-native',
    // Add hls use mpegts
    '--hls-use-mpegts',
    // Add hls start offset
    '--hls-start-offset', '0',
    // Add hls end offset
    '--hls-end-offset', duration.toString(),
    // Add hls segment threads
    '--hls-segment-threads', '4',
    // Add hls segment timeout
    '--hls-segment-timeout', '30',
    // Add hls segment retries
    '--hls-segment-retries', '10',
    // Add hls segment retry sleep
    '--hls-segment-retry-sleep', 'exp=1:10',
    // Add hls segment buffer size
    '--hls-segment-buffer-size', '16M',
    // Add hls segment download retries
    '--hls-segment-download-retries', '10',
    // Add hls segment download timeout
    '--hls-segment-download-timeout', '30',
    // Add hls segment download retry sleep
    '--hls-segment-download-retry-sleep', 'exp=1:10',
    // Add hls segment download buffer size
    '--hls-segment-download-buffer-size', '16M',
    // Add hls segment download chunk size
    '--hls-segment-download-chunk-size', '16M',
    // Add hls segment download max retries
    '--hls-segment-download-max-retries', '10',
    // Add hls segment download max timeout
    '--hls-segment-download-max-timeout', '30',
    // Add hls segment download max retry sleep
    '--hls-segment-download-max-retry-sleep', 'exp=1:10',
    // Add hls segment download max buffer size
    '--hls-segment-download-max-buffer-size', '16M',
    // Add hls segment download max chunk size
    '--hls-segment-download-max-chunk-size', '16M'
  ];
  
  // Log the exact command for manual testing
  const manualCommand = `yt-dlp "${streamUrl}" -o "${outputPath.replace(/\\/g, '/')}" -f "bestvideo+bestaudio/best" --no-part --no-playlist`;
  console.log(`🧪 Manual test command: ${manualCommand}`);
  
  const fullCommand = `yt-dlp ${args.join(' ')}`;
  console.log(`🔄 Running full command: ${fullCommand}`);
  
  return new Promise((resolve) => {
    try {
      const ytdlpProcess = spawn('yt-dlp', args);
      
      // Collect stdout for debugging
      let stdoutChunks: string[] = [];
      let stderrChunks: string[] = [];
      
      // Set up logging for the process with better formatting
      ytdlpProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
          console.log(`[yt-dlp] ${output}`);
          stdoutChunks.push(output);
        }
      });
      
      ytdlpProcess.stderr.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
          console.log(`[yt-dlp stderr] ${output}`);
          stderrChunks.push(output);
        }
      });
      
      // Set timeout to kill the process after duration seconds
      const timeout = setTimeout(() => {
        console.log(`⏱️ Recording for ${duration} seconds completed, stopping...`);
        ytdlpProcess.kill('SIGTERM');
      }, duration * 1000);
      
      ytdlpProcess.on('close', async (code) => {
        clearTimeout(timeout);
        const endTime = new Date();
        const recordingDuration = (endTime.getTime() - startTime.getTime()) / 1000;
        
        console.log(`🕒 Recording ended at: ${endTime.toISOString()}`);
        console.log(`⏱️ Actual recording duration: ${recordingDuration.toFixed(2)} seconds`);
        
        console.log(`📋 yt-dlp process exited with code: ${code}`);
        
        // Check for output file with all possible extensions
        const actualFilePath = findFileWithExtensions(outputPath, VIDEO_EXTENSIONS);
        
        if (actualFilePath) {
          const isPart = actualFilePath.endsWith('.part');
          const stats = fs.statSync(actualFilePath);
          const fileSizeInMB = stats.size / (1024 * 1024);
          
          console.log(`✅ ${isPart ? 'Partial' : 'Complete'} recording found: ${actualFilePath}`);
          console.log(`📊 File size: ${fileSizeInMB.toFixed(2)} MB`);
          
          // Handle .part files by renaming if needed
          let finalPath = actualFilePath;
          if (isPart) {
            const newPath = actualFilePath.replace('.part', '');
            try {
              fs.renameSync(actualFilePath, newPath);
              console.log(`🔄 Renamed partial file to: ${newPath}`);
              finalPath = newPath;
            } catch (error) {
              console.log(`⚠️ Could not rename partial file: ${error}`);
            }
          }
          
          // Extract metadata if file exists and is not empty
          if (stats.size > 0) {
            try {
              console.log(`🔍 Extracting metadata from: ${finalPath}`);
              const metadata = await getVideoMetadata(finalPath);
              
              if (metadata.duration) {
                console.log(`⏱️ Video duration: ${metadata.duration.toFixed(2)} seconds`);
              }
              
              if (metadata.resolution) {
                console.log(`📏 Video resolution: ${metadata.resolution}`);
              }
              
              resolve({
                success: true,
                filePath: finalPath,
                fileSize: stats.size,
                duration: metadata.duration,
                resolution: metadata.resolution,
                isPart: isPart
              });
            } catch (error) {
              console.log(`⚠️ Error extracting metadata: ${error}`);
              resolve({
                success: true,
                filePath: finalPath,
                fileSize: stats.size,
                isPart: isPart
              });
            }
          } else {
            console.log(`⚠️ File exists but is empty (0 bytes)`);
            resolve({
              success: false,
              filePath: finalPath,
              fileSize: 0,
              isPart: isPart
            });
          }
        } else {
          console.log(`❌ No output file found at: ${outputPath}`);
          console.log(`🔍 Searched for extensions: ${VIDEO_EXTENSIONS.join(', ')}`);
          console.log(`📋 Directory content of ${RECORDINGS_DIR}:`);
          
          try {
            const dirFiles = fs.readdirSync(RECORDINGS_DIR);
            dirFiles.forEach(file => {
              const filePath = path.join(RECORDINGS_DIR, file);
              const stats = fs.statSync(filePath);
              console.log(`- ${file} (${stats.size} bytes)`);
            });
          } catch (error) {
            console.log(`⚠️ Could not read directory: ${error}`);
          }
          
          console.log('📋 Last yt-dlp output:');
          if (stdoutChunks.length > 0) {
            console.log(stdoutChunks.slice(-5).join('\n'));
          }
          
          console.log('📋 Last yt-dlp error output:');
          if (stderrChunks.length > 0) {
            console.log(stderrChunks.slice(-5).join('\n'));
          }
          
          resolve({
            success: false,
            filePath: '',
          });
        }
      });
    } catch (error) {
      console.error(`❌ Failed to spawn yt-dlp process: ${error}`);
      resolve({
        success: false,
        filePath: '',
      });
    }
  });
}

/**
 * Generate thumbnail for the recorded video
 */
async function generateThumbnail(videoPath: string): Promise<string | null> {
  return new Promise(async (resolve) => {
    try {
      const thumbnailPath = videoPath.replace(/\.[^/.]+$/, '.jpg');
      const command = `ffmpeg -i "${videoPath}" -ss 00:00:01 -vframes 1 "${thumbnailPath}"`;
      
      const { stderr } = await execPromise(command);
      
      if (fs.existsSync(thumbnailPath)) {
        console.log(`✅ Thumbnail generated successfully: ${thumbnailPath}`);
        resolve(thumbnailPath);
      } else {
        console.log('⚠️ Thumbnail file not found after generation');
        console.error('FFmpeg error:', stderr);
        resolve(null);
      }
    } catch (error) {
      console.error(`❌ Failed to spawn ffmpeg process: ${error}`);
      resolve(null);
    }
  });
}

/**
 * Main function to run the test
 */
async function main() {
  try {
    // Initialize services
    const streamDetector = new StreamDetectorService();
    
    // Configure file hosting services
    fileHostService.setMixdropConfig({
      email: process.env.MIXDROP_EMAIL,
      apiKey: process.env.MIXDROP_API_KEY
    });

    // Test URL for adult streaming
    const testUrl = 'https://stripchat.global/SonyaParker';
    
    // Extract stream name from URL
    const streamName = testUrl.split('/').pop() || 'unknown_stream';
    console.log(`\n🔍 Testing stream detection for: ${testUrl}`);
    console.log(`📝 Stream name: ${streamName}`);
    
    // Initialize stream detector
    await streamDetector.initialize();
    
    // Detect stream URL
    const streamUrl = await streamDetector.detectStream(testUrl);
    if (!streamUrl) {
      console.log('❌ No stream detected');
      return;
    }
    
    console.log(`✅ Stream detected: ${streamUrl}`);
    
    // Generate output filename with stream name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputName = `${streamName}_${timestamp}`;
    
    // Record stream for 1 minute (60 seconds)
    console.log(`\n🎥 Starting recording for: ${testUrl}`);
    const result = await recordStream(streamUrl, outputName, 60);
    
    if (result.success) {
      console.log(`✅ Recording completed successfully`);
      console.log(`📁 File path: ${result.filePath}`);
      if (result.fileSize) {
        console.log(`📊 File size: ${(result.fileSize / 1024 / 1024).toFixed(2)} MB`);
      }
      if (result.duration) {
        console.log(`⏱️ Duration: ${result.duration.toFixed(2)} seconds`);
      }
      if (result.resolution) {
        console.log(`📏 Resolution: ${result.resolution}`);
      }
      
      // Generate thumbnail
      console.log(`\n🖼️ Generating thumbnail...`);
      const thumbnailPath = await generateThumbnail(result.filePath);
      if (thumbnailPath) {
        console.log(`✅ Thumbnail generated: ${thumbnailPath}`);
      }
      
      // Upload to file hosting services
      console.log(`\n📤 Uploading to file hosting services...`);
      const uploadResults = await fileHostService.uploadToMultipleHosts(result.filePath);
      console.log('Upload results:', uploadResults);
      
      // Log individual hosting results if available
      const mixdropResult = uploadResults.find((r: any) => r.hostName === 'mixdrop');
      if (mixdropResult) {
        console.log('Mixdrop upload:', mixdropResult.success ? '✅' : '❌', mixdropResult.url || mixdropResult.error);
      }
      
      const gofilesResult = uploadResults.find((r: any) => r.hostName === 'gofiles');
      if (gofilesResult) {
        console.log('Gofiles upload:', gofilesResult.success ? '✅' : '❌', gofilesResult.url || gofilesResult.error);
      }
      
      // Clean up
      console.log(`\n🧹 Cleaning up...`);
      try {
        fs.unlinkSync(result.filePath);
        if (thumbnailPath) {
          fs.unlinkSync(thumbnailPath);
        }
        console.log('✅ Cleanup completed');
      } catch (error) {
        console.log('⚠️ Error during cleanup:', error);
      }
    } else {
      console.log('❌ Recording failed');
    }
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

// Run the test
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});