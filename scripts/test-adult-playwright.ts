import { PlaywrightHandler } from './lib/playwrightHandler';
import path from 'path';
import { logger } from '../lib/utils/logger';

async function testAdultPlaywright() {
  logger.info('Starting Adult PlaywrightHandler test...');
  
  const options = {
    headless: true, // Set to true for production
    screenshots: true,
    screenshotsDir: path.join(process.cwd(), 'recordings', 'test-screenshots')
  };
  
  const handler = new PlaywrightHandler(options);
  
  try {
    logger.info('Initializing browser...');
    await handler.init();
    
    // Test with a known adult streaming site
    const testUrl = 'https://www.cht.xxx'; // This is just the homepage, not a specific performer
    
    logger.info(`Navigating to ${testUrl}...`);
    await handler.navigateToStream(testUrl);
    
    logger.info('Taking screenshot of homepage...');
    await handler.takeScreenshot('adult-site-homepage');
    
    // Attempt to extract any stream URLs (even though we're just on the homepage)
    logger.info('Attempting to extract stream URLs...');
    const streamUrl = await handler.extractStreamUrl();
    
    if (streamUrl) {
      logger.info(`Found stream URL: ${streamUrl}`);
    } else {
      logger.info('No stream URL found on homepage (expected)');
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

testAdultPlaywright(); 