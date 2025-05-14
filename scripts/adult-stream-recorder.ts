#!/usr/bin/env ts-node
import dotenv from 'dotenv';
// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

import path from 'path';
import fs from 'fs';
import { logger } from '../lib/utils/logger';
import { ensureDirectoryExists } from '../lib/utils/paths';
import { generateThumbnails } from '../lib/utils/ffmpeg';
import platforms from '../config/platforms';
import { PlaywrightHandler, StreamInfo } from './lib/playwrightHandler';
import { CookieManager } from './lib/cookieManager';
import { Downloader, RecordingResult } from './lib/downloader';
import readline from 'readline';
import type { BrowserContext } from 'playwright';

// Configure base directories
const BASE_DIR = process.cwd();
const RECORDINGS_DIR = path.join(BASE_DIR, 'recordings', 'adult');
const THUMBNAILS_DIR = path.join(BASE_DIR, 'public', 'thumbnails');
const COOKIES_DIR = path.join(BASE_DIR, 'data', 'cookies');
const LOGS_DIR = path.join(BASE_DIR, 'logs');

// Ensure all directories exist
[RECORDINGS_DIR, THUMBNAILS_DIR, COOKIES_DIR, LOGS_DIR].forEach(ensureDirectoryExists);

interface RecordingOptions {
  url: string;
  duration: number;
  name?: string;
  platform?: string;
  method?: 'yt-dlp' | 'streamlink' | 'ffmpeg';
  headless?: boolean;
  thumbnails?: boolean;
  notify?: boolean;
  cookies?: boolean;
  forceRecord?: boolean;
  debug?: boolean;
}

/**
 * Parse command line arguments
 */
function parseArguments(): RecordingOptions {
  const args = process.argv.slice(2);
  const options: RecordingOptions = {
    url: '',
    duration: 30,
    headless: true,
    thumbnails: true,
    notify: false,
    cookies: true,
    forceRecord: false,
    debug: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--url' && i + 1 < args.length) {
      options.url = args[++i];
    } else if (arg === '--duration' && i + 1 < args.length) {
      options.duration = parseInt(args[++i], 10);
    } else if (arg === '--name' && i + 1 < args.length) {
      options.name = args[++i];
    } else if (arg === '--platform' && i + 1 < args.length) {
      options.platform = args[++i];
    } else if (arg === '--method' && i + 1 < args.length) {
      const method = args[++i].toLowerCase();
      if (['yt-dlp', 'streamlink', 'ffmpeg'].includes(method)) {
        options.method = method as 'yt-dlp' | 'streamlink' | 'ffmpeg';
      }
    } else if (arg === '--no-headless') {
      options.headless = false;
    } else if (arg === '--no-thumbnails') {
      options.thumbnails = false;
    } else if (arg === '--notify') {
      options.notify = true;
    } else if (arg === '--no-cookies') {
      options.cookies = false;
    } else if (arg === '--force') {
      options.forceRecord = true;
    } else if (arg === '--debug') {
      options.debug = true;
    } else if (!options.url && arg.startsWith('http')) {
      // If URL is provided as first positional argument
      options.url = arg;
    }
  }

  // If no URL provided, use default test stream
  if (!options.url) {
    options.url = 'https://www.youtube.com/watch?v=jfKfPfyJRdk';
    logger.info('No URL provided, using default test stream');
  }

  return options;
}

/**
 * Identify platform from URL
 */
function identifyPlatform(url: string): { platformKey: string; platformConfig: any } {
  // Check for alternative domains
  if (url.includes('cht.xxx') || url.includes('www.cht.xxx')) {
    return { platformKey: 'Chaturbate', platformConfig: platforms['Chaturbate'] };
  }
  
  if (url.includes('stripchat.global') || url.includes('www.stripchat.global')) {
    return { platformKey: 'Stripchat', platformConfig: platforms['Stripchat'] };
  }
  
  // Check platforms defined in config
  for (const [platformKey, config] of Object.entries(platforms)) {
    if (url.includes(config.baseUrl.replace('https://', '')) || 
        url.includes(config.baseUrl.replace('https://www.', ''))) {
      return { platformKey, platformConfig: config };
    }
  }
  
  // Default to generic if no match
  return { platformKey: 'Generic', platformConfig: null };
}

/**
 * Extract performer name from URL
 */
function extractPerformerName(url: string, platformConfig?: any): string {
  // Parse URL to extract path
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    // If no path parts, return 'unknown'
    if (!pathParts.length) {
      return 'unknown';
    }
    
    // Default to first path part
    return pathParts[0];
  } catch (error: unknown) {
    const err = error as Error;
    logger.warn(`Could not parse URL to extract performer name: ${err.message}`);
    return 'unknown';
  }
}

/**
 * Setup browser handler with appropriate options
 */
async function setupBrowser(options: RecordingOptions): Promise<PlaywrightHandler> {
  const playwrightHandler = new PlaywrightHandler({
    headless: options.headless,
    screenshots: true,
    screenshotsDir: path.join(RECORDINGS_DIR, 'screenshots')
  });
  
  await playwrightHandler.init();
  return playwrightHandler;
}

/**
 * Generate thumbnail for a recording
 */
async function createThumbnail(videoPath: string): Promise<string | null> {
  try {
    const filename = path.basename(videoPath, path.extname(videoPath)) + '.jpg';
    const thumbnailPath = path.join(THUMBNAILS_DIR, filename);
    
    logger.info(`Generating thumbnail for ${videoPath} at ${thumbnailPath}`);
    await generateThumbnails({
      inputPath: videoPath,
      outputPath: thumbnailPath,
      count: 1,
      timeOffset: '5'
    });
    
    if (fs.existsSync(thumbnailPath)) {
      logger.info(`Thumbnail generated successfully: ${thumbnailPath}`);
      return thumbnailPath;
    } else {
      logger.warn(`Failed to generate thumbnail: file not created`);
      return null;
    }
  } catch (error: unknown) {
    const err = error as Error;
    logger.error(`Error generating thumbnail: ${err.message}`);
    return null;
  }
}

/**
 * Send notification (webhook/Slack)
 */
async function sendNotification(message: string, result: RecordingResult): Promise<void> {
  // Implemented placeholder for notification system
  // This would be expanded to send to Slack, Discord, etc.
  logger.info(`[NOTIFICATION] ${message}`);
  
  // Webhook URL from environment
  const webhookUrl = process.env.NOTIFICATION_WEBHOOK;
  if (!webhookUrl) {
    logger.debug('No webhook URL configured for notifications');
    return;
  }
  
  try {
    // Simple HTTP POST to webhook
    const payload = {
      text: message,
      attachments: [
        {
          title: 'Recording Details',
          fields: [
            { title: 'File', value: path.basename(result.filePath), short: true },
            { title: 'Size', value: `${(result.fileSize! / (1024 * 1024)).toFixed(2)} MB`, short: true },
            { title: 'Duration', value: `${result.duration?.toFixed(2) || 'unknown'} seconds`, short: true },
            { title: 'Method', value: result.method, short: true }
          ]
        }
      ]
    };
    
    // This would be implemented with fetch or axios
    logger.debug(`Would send notification to webhook: ${JSON.stringify(payload)}`);
  } catch (error: unknown) {
    const err = error as Error;
    logger.error(`Failed to send notification: ${err.message}`);
  }
}

/**
 * Wait for user input (for debugging and testing)
 */
async function waitForUserInput(prompt: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    rl.question(prompt, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Get browser context safely from PlaywrightHandler
 */
function getBrowserContext(browser: PlaywrightHandler): BrowserContext | null {
  // Access through internal property using type assertion
  // This is a workaround for accessing the private property
  return (browser as any).context;
}

/**
 * Main function to run the recorder
 */
async function main() {
  // Parse command line arguments
  const options = parseArguments();
  
  // Set up extra debug logging if requested
  if (options.debug) {
    logger.level = 'debug';
    logger.debug('Debug logging enabled');
  }
  
  logger.info('=== Adult Stream Recorder ===');
  logger.info(`URL: ${options.url}`);
  logger.info(`Duration: ${options.duration} seconds`);
  logger.info(`Headless mode: ${options.headless ? 'yes' : 'no'}`);
  logger.info(`Generate thumbnails: ${options.thumbnails ? 'yes' : 'no'}`);
  logger.info(`Use cookies: ${options.cookies ? 'yes' : 'no'}`);
  logger.info(`Force recording: ${options.forceRecord ? 'yes' : 'no'}`);
  
  try {
    // Identify platform from URL
    const { platformKey, platformConfig } = identifyPlatform(options.url);
    logger.info(`Detected platform: ${platformKey}`);
    
    // Get or use provided performer name
    const performerName = options.name || extractPerformerName(options.url, platformConfig);
    logger.info(`Performer: ${performerName}`);
    
    // Initialize services
    const browser = await setupBrowser(options);
    const cookieManager = options.cookies ? new CookieManager({ cookiesDir: COOKIES_DIR }) : null;
    const downloader = new Downloader({
      outputDir: RECORDINGS_DIR,
      preferredMethod: options.method
    });
    
    // Load cookies if available
    if (cookieManager && options.cookies) {
      const domain = new URL(options.url).hostname;
      const browserContext = getBrowserContext(browser);
      if (cookieManager.hasCookies(domain) && browserContext) {
        logger.info(`Loading cookies for ${domain}`);
        await cookieManager.loadCookies(browserContext, domain);
      }
    }
    
    // Navigate to stream
    await browser.navigateToStream(options.url);
    
    // Check if performer is online
    let isOnline = true;
    if (platformConfig?.isOnlineSelectors && !options.forceRecord) {
      isOnline = await browser.checkPerformerStatus(platformConfig.isOnlineSelectors);
      logger.info(`Performer online status: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
    }
    
    // Take a screenshot
    const screenshotPath = await browser.takeScreenshot(`${performerName}-check`);
    
    // Save cookies for future use
    if (cookieManager && options.cookies) {
      const domain = new URL(options.url).hostname;
      const browserContext = getBrowserContext(browser);
      if (browserContext) {
        await cookieManager.saveCookies(browserContext, domain);
      }
    }
    
    // Skip recording if performer is offline and not forcing
    if (!isOnline && !options.forceRecord) {
      logger.warn(`Performer is offline, skipping recording`);
      await browser.close();
      return;
    }
    
    // Extract direct stream URL if possible
    let streamUrl = options.url;
    const extractedUrl = await browser.extractStreamUrl();
    
    if (extractedUrl) {
      logger.info(`Extracted direct stream URL: ${extractedUrl}`);
      streamUrl = extractedUrl;
    } else {
      logger.info(`Could not extract direct stream URL, using page URL`);
    }
    
    // Record the stream
    let cookiePath: string | undefined = undefined;
    if (cookieManager && options.cookies) {
      const domain = new URL(options.url).hostname;
      if (cookieManager.hasCookies(domain)) {
        cookiePath = cookieManager.getCookieFilePath(domain);
      }
    }
    
    // If not running in headless mode, wait for user to confirm
    if (!options.headless) {
      await waitForUserInput('Press Enter to start recording...');
    }
    
    logger.info(`Starting recording of ${streamUrl} for ${options.duration} seconds...`);
    
    const recordingResult = await downloader.recordStream(
      streamUrl,
      platformKey,
      performerName,
      {
        duration: options.duration,
        cookiePath
      }
    );
    
    // Close browser after recording
    await browser.close();
    
    if (recordingResult.success) {
      logger.info(`Recording completed successfully: ${recordingResult.filePath}`);
      logger.info(`File size: ${(recordingResult.fileSize! / (1024 * 1024)).toFixed(2)} MB`);
      
      if (recordingResult.duration) {
        logger.info(`Video duration: ${recordingResult.duration.toFixed(2)} seconds`);
      }
      
      // Generate thumbnail if requested
      if (options.thumbnails) {
        const thumbnailPath = await createThumbnail(recordingResult.filePath);
        if (thumbnailPath) {
          logger.info(`Thumbnail created: ${thumbnailPath}`);
        }
      }
      
      // Send notification if requested
      if (options.notify) {
        await sendNotification(
          `Successfully recorded ${performerName} from ${platformKey}`,
          recordingResult
        );
      }
    } else {
      logger.error(`Recording failed: ${recordingResult.error}`);
    }
    
    logger.info('=== Recording Session Complete ===');
  } catch (error: unknown) {
    const err = error as Error;
    logger.error(`Error in recorder: ${err.message}`);
    logger.debug(err.stack || 'No stack trace available');
  }
}

// Run the recorder
main().catch(error => {
  const err = error as Error;
  logger.error('Fatal error:', err);
  process.exit(1);
}); 