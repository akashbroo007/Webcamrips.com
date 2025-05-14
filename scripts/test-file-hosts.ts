import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import fileHostService from '../lib/services/FileHostService';
import { logger } from '../lib/utils/logger';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function main() {
  try {
    // Configure file host services
    fileHostService.setMixdropConfig({
      email: process.env.MIXDROP_EMAIL,
      apiKey: process.env.MIXDROP_API_KEY
    });

    fileHostService.setGofilesConfig({
      token: process.env.GOFILES_TOKEN
    });

    // Create a test file
    const testFilePath = path.join(process.cwd(), 'temp', 'test.txt');
    const testContent = 'This is a test file for upload ' + new Date().toISOString();

    // Ensure temp directory exists
    if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
      fs.mkdirSync(path.join(process.cwd(), 'temp'));
    }

    // Write test file
    fs.writeFileSync(testFilePath, testContent);
    logger.info('Created test file:', testFilePath);

    // Test upload to multiple hosts
    logger.info('\nTesting upload to multiple hosts...');
    const results = await fileHostService.uploadToMultipleHosts(testFilePath);
    logger.info('Upload results:', results);

    // Clean up test file
    fs.unlinkSync(testFilePath);
    logger.info('\nTest file cleaned up');

    // Summary
    logger.info('\nTest Summary:');
    
    // Find results by host
    const mixdropResult = results.find(r => r.hostName === 'mixdrop');
    const gofilesResult = results.find(r => r.hostName === 'gofiles');
    
    if (mixdropResult) {
      logger.info('Mixdrop:', mixdropResult.success ? 'Success' : 'Failed', mixdropResult.url || mixdropResult.error);
    }
    
    if (gofilesResult) {
      logger.info('Gofiles:', gofilesResult.success ? 'Success' : 'Failed', gofilesResult.url || gofilesResult.error);
    }
    
    logger.info('Multiple:', results.filter(r => r.success).length, 'of', results.length, 'uploads successful');

  } catch (error) {
    logger.error('Test failed:', error);
  }
}

// Run the test
main().catch(error => {
  logger.error('Fatal error:', error);
  process.exit(1);
}); 