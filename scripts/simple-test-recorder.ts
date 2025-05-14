import dotenv from 'dotenv';
// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Configure output directories
const RECORDINGS_DIR = path.join(process.cwd(), 'recordings');
const THUMBNAILS_DIR = path.join(process.cwd(), 'public', 'thumbnails');

// Create directories if they don't exist
[RECORDINGS_DIR, THUMBNAILS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function testStreamRecording() {
  try {
    console.log('Starting test recording without database...');
    
    // Test URL - using a public livestream for testing
    const testStreamUrl = 'https://www.youtube.com/watch?v=jfKfPfyJRdk';
    const outputFilename = `test-recording-${Date.now()}.mp4`;
    const outputPath = path.join(RECORDINGS_DIR, outputFilename);
    
    console.log(`Starting test recording to ${outputPath}...`);
    
    // Use yt-dlp to record the stream
    const args = [
      testStreamUrl,
      '--format', 'best',
      '-o', outputPath,
      '--no-playlist',
      '--max-filesize', '100M'  // Limit file size to 100MB for testing
    ];
    
    console.log(`Running command: yt-dlp ${args.join(' ')}`);
    
    const ytdlpProcess = spawn('yt-dlp', args);
    
    // Set up logging for the process
    ytdlpProcess.stdout.on('data', (data) => {
      console.log(`[test] stdout: ${data.toString()}`);
    });
    
    ytdlpProcess.stderr.on('data', (data) => {
      console.log(`[test] stderr: ${data.toString()}`);
    });
    
    // Wait for process to finish or timeout after 15 seconds
    const result = await new Promise((resolve) => {
      console.log('Recording...');
      
      // Set timeout to kill the process after 15 seconds
      const timeout = setTimeout(() => {
        console.log('Timeout reached, stopping recording...');
        ytdlpProcess.kill('SIGTERM');
        resolve(false);
      }, 15 * 1000);
      
      ytdlpProcess.on('close', (code) => {
        clearTimeout(timeout);
        console.log(`yt-dlp process exited with code ${code}`);
        resolve(code === 0);
      });
    });
    
    // Check if file was created
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log(`Recording successful! File size: ${stats.size} bytes`);
      return true;
    } else if (fs.existsSync(`${outputPath}.part`)) {
      const stats = fs.statSync(`${outputPath}.part`);
      console.log(`Recording in progress! Partial file created with size: ${stats.size} bytes`);
      return true;
    } else {
      console.error('Recording failed! Output file not found.');
      return false;
    }
    
    console.log('Test completed.');
  } catch (error) {
    console.error('Error in test:', error);
    return false;
  } finally {
    // Exit the process
    process.exit(0);
  }
}

// Run the test
testStreamRecording(); 