import dotenv from 'dotenv';
// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';
import platforms from '../config/platforms';

// Configure output directories
const RECORDINGS_DIR = path.join(process.cwd(), 'recordings', 'adult-test');
const THUMBNAILS_DIR = path.join(process.cwd(), 'public', 'thumbnails');

// Create directories if they don't exist
[RECORDINGS_DIR, THUMBNAILS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

interface StreamInfo {
  isOnline: boolean;
  streamUrl?: string;
  performerName?: string;
  platform?: string;
}

/**
 * Get platform config based on URL
 */
function getPlatformFromUrl(url: string) {
  // Check for alternative domains
  if (url.includes('cht.xxx') || url.includes('www.cht.xxx')) {
    return { key: 'Chaturbate', config: platforms['Chaturbate'] };
  }
  
  if (url.includes('stripchat.global') || url.includes('www.stripchat.global')) {
    return { key: 'Stripchat', config: platforms['Stripchat'] };
  }
  
  // Original domain check
  for (const [platformKey, config] of Object.entries(platforms)) {
    if (url.includes(config.baseUrl.replace('https://', '')) || 
        url.includes(config.baseUrl.replace('https://www.', ''))) {
      return { key: platformKey, config };
    }
  }
  return null;
}

/**
 * Detect if a stream is online using Puppeteer
 */
async function detectStream(url: string): Promise<StreamInfo> {
  console.log(`Checking stream status for ${url}...`);
  
  // Determine platform from URL
  const platform = getPlatformFromUrl(url);
  if (!platform) {
    console.log('Unsupported platform or URL format');
    return { isOnline: false };
  }
  
  console.log(`Detected platform: ${platform.key}`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set adult content permission
    const context = browser.defaultBrowserContext();
    await context.overridePermissions(url, ['geolocation', 'notifications']);
    
    // Set viewport and user agent from platform config
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(platform.config.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
    
    // Navigate to page
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    console.log('Page loaded, checking stream status...');
    
    // Extract performer name from URL
    const urlParts = url.split('/');
    let performerName = urlParts[urlParts.length - 2] || urlParts[urlParts.length - 1] || 'unknown';
    if (performerName === '') {
      performerName = urlParts[urlParts.length - 2] || 'unknown';
    }
    
    // Get title for performer name
    const titleElement = await page.$('title');
    let pageTitle = '';
    if (titleElement) {
      pageTitle = await page.evaluate(el => el.textContent || '', titleElement);
      console.log(`Page title: ${pageTitle}`);
    }
    
    // Check if performer is online using platform selectors
    let isOnline = false;
    
    // Check positive selectors (elements that should exist if stream is online)
    console.log('Checking positive selectors:', platform.config.isOnlineSelectors.positive);
    for (const selector of platform.config.isOnlineSelectors.positive) {
      try {
        const element = await page.$(selector);
        if (element) {
          console.log(`Found positive selector: ${selector}`);
          isOnline = true;
        } else {
          console.log(`Missing positive selector: ${selector}`);
          isOnline = false;
          break;
        }
      } catch (error) {
        console.log(`Error checking selector ${selector}:`, error);
      }
    }
    
    // Check negative selectors (elements that should NOT exist if stream is online)
    if (isOnline && platform.config.isOnlineSelectors.negative) {
      console.log('Checking negative selectors:', platform.config.isOnlineSelectors.negative);
      for (const selector of platform.config.isOnlineSelectors.negative) {
        try {
          const element = await page.$(selector);
          if (element) {
            console.log(`Found negative selector: ${selector} (stream is offline)`);
            isOnline = false;
            break;
          } else {
            console.log(`Missing negative selector: ${selector} (good)`);
          }
        } catch (error) {
          console.log(`Error checking selector ${selector}:`, error);
        }
      }
    }
    
    // Take a screenshot of the page
    const screenshotPath = path.join(RECORDINGS_DIR, `${performerName}-check.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`Screenshot saved to ${screenshotPath}`);
    
    return { 
      isOnline, 
      streamUrl: isOnline ? url : undefined, 
      performerName, 
      platform: platform.key 
    };
  } catch (error) {
    console.error('Error detecting stream:', error);
    return { isOnline: false };
  } finally {
    await browser.close();
  }
}

/**
 * Record the stream using yt-dlp with platform-specific settings
 */
async function recordStream(streamUrl: string, performerName: string, platformKey: string, duration: number = 30): Promise<string> {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const outputFilename = `${performerName}-${timestamp}.mp4`;
  const outputPath = path.join(RECORDINGS_DIR, outputFilename);
  
  console.log(`Starting recording of ${streamUrl} for ${duration} seconds...`);
  console.log(`Output file: ${outputPath}`);
  
  return new Promise((resolve, reject) => {
    // Get platform-specific yt-dlp flags
    const platformConfig = platforms[platformKey];
    const platformFlags = platformConfig?.ytdlpFlags || [];
    
    // Use yt-dlp to record the stream
    const args = [
      streamUrl,
      '--format', 'best',
      '-o', outputPath,
      '--no-part',
      '--no-playlist',
      ...platformFlags
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
          console.log('Recording is in progress (partial file)');
          resolve(`${outputPath}.part`);
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
 * Main function to run the test
 */
async function main() {
  try {
    // Accept stream URL from command line or use default test URLs
    const args = process.argv.slice(2);
    const url = args[0];
    const duration = args[1] ? parseInt(args[1], 10) : 15;
    
    if (!url) {
      console.log('No URL provided. Please provide a cam site URL to test.');
      console.log('Supported platforms:');
      Object.entries(platforms).forEach(([key, config]) => {
        console.log(`- ${key}: ${config.baseUrl} (Example: ${config.streamUrlPattern.replace('{identifier}', 'example_performer')})`);
      });
      console.log('\nUsage examples:');
      console.log('npx ts-node -P tsconfig.scripts.json scripts/test-adult-stream.ts "https://chaturbate.com/performer_name/" 15');
      console.log('npx ts-node -P tsconfig.scripts.json scripts/test-adult-stream.ts "https://stripchat.com/performer_name" 20');
      return;
    }
    
    console.log(`Testing adult stream recording with URL: ${url}`);
    console.log(`Recording duration: ${duration} seconds`);
    
    // First check if the stream is online
    const streamInfo = await detectStream(url);
    
    if (streamInfo.isOnline && streamInfo.streamUrl && streamInfo.platform) {
      console.log(`✅ Stream is ONLINE: ${streamInfo.performerName} on ${streamInfo.platform}`);
      
      // Record the stream
      const recordingPath = await recordStream(
        streamInfo.streamUrl,
        streamInfo.performerName || 'performer',
        streamInfo.platform,
        duration
      );
      
      console.log(`✅ Recording completed: ${recordingPath}`);
    } else {
      console.log('❌ Stream is OFFLINE or could not be detected');
      
      // Suggest checking with a browser
      console.log('\nSuggestions:');
      console.log('1. Verify the URL is correct and the performer is actually online by checking in a browser');
      console.log('2. Make sure your browser cookies are available if the site requires login');
      console.log('3. For testing purposes, you can use YouTube live streams as a substitute:');
      console.log('   npx ts-node -P tsconfig.scripts.json scripts/simple-test-recorder.ts');
    }
    
  } catch (error) {
    console.error('Error in test:', error);
  }
}

// Run the test
main(); 