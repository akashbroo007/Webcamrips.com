import dotenv from 'dotenv';
// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Configure output directories
const RECORDINGS_DIR = path.join(process.cwd(), 'recordings', 'test');
const THUMBNAILS_DIR = path.join(process.cwd(), 'public', 'thumbnails');

// Create directories if they don't exist
[RECORDINGS_DIR, THUMBNAILS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Record the stream using yt-dlp
 */
async function recordStream(streamUrl: string, channelName: string, duration: number = 15): Promise<string> {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const outputFilename = `${channelName}-${timestamp}.mp4`;
  const outputPath = path.join(RECORDINGS_DIR, outputFilename);
  
  console.log(`Starting recording of ${streamUrl} for ${duration} seconds...`);
  console.log(`Output file: ${outputPath}`);
  
  return new Promise((resolve, reject) => {
    // Use yt-dlp to record the stream
    const args = [
      streamUrl,
      '--format', 'best',
      '-o', outputPath,
      '--no-part',
      '--no-playlist'
    ];
    
    console.log(`Running command: yt-dlp ${args.join(' ')}`);
    
    const ytdlpProcess = spawn('yt-dlp', args);
    
    // Set up logging for the process
    ytdlpProcess.stdout.on('data', (data) => {
      console.log(`[yt-dlp] ${data.toString()}`);
    });
    
    ytdlpProcess.stderr.on('data', (data) => {
      console.log(`[yt-dlp stderr] ${data.toString()}`);
    });
    
    // Set timeout to kill the process after duration seconds
    const timeout = setTimeout(() => {
      console.log(`Recording for ${duration} seconds completed, stopping...`);
      ytdlpProcess.kill('SIGTERM');
    }, duration * 1000);
    
    ytdlpProcess.on('close', (code) => {
      clearTimeout(timeout);
      
      if (code === 0 || code === null) {
        console.log('Recording completed successfully');
        
        // Check if file exists
        if (fs.existsSync(outputPath)) {
          const stats = fs.statSync(outputPath);
          console.log(`File size: ${stats.size} bytes`);
          resolve(outputPath);
        } else if (fs.existsSync(`${outputPath}.part`)) {
          const partPath = `${outputPath}.part`;
          const stats = fs.statSync(partPath);
          console.log(`Recording in progress (partial file). Size: ${stats.size} bytes`);
          resolve(partPath);
        } else {
          reject(new Error('Output file not found after recording'));
        }
      } else {
        console.error(`Recording process exited with code ${code}`);
        reject(new Error(`Recording process exited with code ${code}`));
      }
    });
  });
}

/**
 * Generate thumbnail for the recorded video
 */
async function generateThumbnail(videoPath: string): Promise<string> {
  const thumbnailPath = path.join(
    THUMBNAILS_DIR,
    `${path.basename(videoPath, path.extname(videoPath))}.jpg`
  );
  
  return new Promise((resolve, reject) => {
    console.log(`Generating thumbnail for ${videoPath}...`);
    
    // Use ffmpeg to generate thumbnail at 5 seconds
    const args = [
      '-i', videoPath,
      '-ss', '5',
      '-vframes', '1',
      '-vf', 'scale=640:-1',
      '-q:v', '2',
      thumbnailPath
    ];
    
    console.log(`Running command: ffmpeg ${args.join(' ')}`);
    
    const ffmpegProcess = spawn('ffmpeg', args);
    
    ffmpegProcess.stdout.on('data', (data) => {
      console.log(`[ffmpeg] ${data.toString()}`);
    });
    
    ffmpegProcess.stderr.on('data', (data) => {
      console.log(`[ffmpeg stderr] ${data.toString()}`);
    });
    
    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`Thumbnail generated successfully at ${thumbnailPath}`);
        
        if (fs.existsSync(thumbnailPath)) {
          const stats = fs.statSync(thumbnailPath);
          console.log(`Thumbnail size: ${stats.size} bytes`);
        }
        
        resolve(thumbnailPath);
      } else {
        console.error(`ffmpeg process exited with code ${code}`);
        reject(new Error(`ffmpeg process exited with code ${code}`));
      }
    });
  });
}

/**
 * Main function to run the test
 */
async function main() {
  try {
    // YouTube live streams that are reliable for testing
    const YOUTUBE_TEST_STREAMS = [
      { url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', name: 'lofi-girl' }, // Lofi Girl
      { url: 'https://www.youtube.com/watch?v=zYvAxLX6OzE', name: 'live-cams-japan' }, // Japan walking cam
      { url: 'https://www.youtube.com/watch?v=HpKOSyUwU50', name: 'earth-cams' } // EarthCam
    ];
    
    // Get stream URL from command line or use default
    const args = process.argv.slice(2);
    const streamUrl = args[0] || YOUTUBE_TEST_STREAMS[0].url;
    const duration = args[1] ? parseInt(args[1], 10) : 15;
    
    // Find the name based on URL or use a default
    let channelName = 'youtube-test';
    const testStream = YOUTUBE_TEST_STREAMS.find(s => s.url === streamUrl);
    if (testStream) {
      channelName = testStream.name;
    } else if (streamUrl.includes('youtube.com/watch?v=')) {
      // Extract video ID from URL
      const videoId = new URL(streamUrl).searchParams.get('v');
      if (videoId) {
        channelName = `youtube-${videoId}`;
      }
    }
    
    console.log('=== YouTube Live Stream Recording Test ===');
    console.log(`URL: ${streamUrl}`);
    console.log(`Channel: ${channelName}`);
    console.log(`Duration: ${duration} seconds`);
    console.log('=======================================');
    
    // Step 1: Record the stream
    console.log('\n📹 Step 1: Recording stream...');
    const recordingPath = await recordStream(streamUrl, channelName, duration);
    
    // Step 2: Generate thumbnail
    console.log('\n🖼️ Step 2: Generating thumbnail...');
    const thumbnailPath = await generateThumbnail(recordingPath);
    
    console.log('\n✅ Test completed successfully');
    console.log('=======================================');
    console.log(`Recording: ${recordingPath}`);
    console.log(`Thumbnail: ${thumbnailPath}`);
    console.log('=======================================');
    
  } catch (error) {
    console.error('\n❌ Error in test:', error);
  }
}

// Run the test
main(); 