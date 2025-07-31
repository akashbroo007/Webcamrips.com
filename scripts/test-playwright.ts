import { PlaywrightHandler } from './lib/playwrightHandler';
import path from 'path';
import { logger } from '../lib/utils/logger';

async function testPlaywright() {
  logger.info('Starting PlaywrightHandler test...');
  
  const options = {
    headless: true,
    screenshots: true,
    screenshotsDir: path.join(process.cwd(), 'recordings', 'test-screenshots')
  };
  
  const handler = new PlaywrightHandler(options);
  
  try {
    logger.info('Initializing browser...');
    await handler.init();
    
    logger.info('Navigating to Google...');
    await handler.navigateToStream('https://www.google.com');
    
    logger.info('Taking screenshot...');
    await handler.takeScreenshot('test-screenshot');
    
    logger.info('Test completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error(`Test failed: ${error instanceof Error ? error.message : String(error)}`);
    await handler.close();
    process.exit(1);
  } finally {
    logger.info('Closing browser...');
    await handler.close();
  }
}

testPlaywright(); 