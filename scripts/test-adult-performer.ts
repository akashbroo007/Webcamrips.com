import { PlaywrightHandler } from './lib/playwrightHandler';
import path from 'path';
import { logger } from '../lib/utils/logger';

/**
 * This script tests the PlaywrightHandler with a specific performer page
 * to check if it can successfully navigate, handle age verification, and extract stream URLs.
 */
async function testAdultPerformer() {
  logger.info('Starting Adult Performer Test...');
  
  const options = {
    headless: true, // Set to false for debugging, true for production
    screenshots: true,
    screenshotsDir: path.join(process.cwd(), 'recordings', 'test-screenshots'),
    timeout: 60000 // Longer timeout for adult sites
  };
  
  const handler = new PlaywrightHandler(options);
  
  try {
    logger.info('Initializing browser...');
    await handler.init();
    
    // Test with a specific performer URL (replace with an active performer if needed)
    const performerUrl = 'https://www.cht.xxx/cuddlymoana/';
    
    logger.info(`Navigating to performer page: ${performerUrl}`);
    await handler.navigateToStream(performerUrl);
    
    logger.info('Taking screenshot of performer page...');
    await handler.takeScreenshot('performer-page');
    
    // Check if performer is online
    const isOnline = await handler.checkPerformerStatus({
      positive: [
        '.online-status:has-text("Live")',
        '[class*="online"]:has-text("Live")',
        '[class*="live"]:has-text("Live")',
        '[class*="status"]:has-text("Live")'
      ],
      negative: [
        '.offline-status',
        '[class*="offline"]',
        '[class*="status"]:has-text("Offline")'
      ]
    });
    
    if (isOnline) {
      logger.info('Performer is detected as ONLINE');
      
      // Attempt to extract stream URL
      logger.info('Attempting to extract stream URL...');
      const streamUrl = await handler.extractStreamUrl();
      
      if (streamUrl) {
        logger.info(`Successfully extracted stream URL: ${streamUrl}`);
      } else {
        logger.warn('No stream URL found even though performer is online');
      }
    } else {
      logger.info('Performer is detected as OFFLINE');
    }
    
    logger.info('Test completed successfully!');
    process.exit(0);
  } catch (error: unknown) {
    logger.error(`Test failed: ${error instanceof Error ? error.message : String(error)}`);
    // Still take a screenshot if possible
    try {
      await handler.takeScreenshot('error-screenshot');
    } catch {
      // Ignore any errors during error handling
    }
    await handler.close();
    process.exit(1);
  } finally {
    logger.info('Closing browser...');
    await handler.close();
  }
}

testAdultPerformer(); 