import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import fileHostService from '../lib/services/FileHostService';
import { logger } from '../lib/utils/logger';

// Load environment variables
dotenv.config({ path: '.env.local' });

/**
 * Test script to verify file hosting service uploads
 */
async function testFileHosting() {
  try {
    // Check if credentials are configured
    const mixdropEmail = process.env.MIXDROP_EMAIL;
    const mixdropApiKey = process.env.MIXDROP_API_KEY;
    const gofilesToken = process.env.GOFILES_TOKEN;
    
    console.log('File Host Test Configuration:');
    console.log(`Mixdrop Email: ${mixdropEmail ? '✓ Configured' : '✗ Missing'}`);
    console.log(`Mixdrop API Key: ${mixdropApiKey ? '✓ Configured' : '✗ Missing'}`);
    console.log(`Gofiles Token: ${gofilesToken ? '✓ Configured' : '✗ Missing'}`);
    
    // Create a test file if it doesn't exist
    const testDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    const testFilePath = path.join(testDir, 'test-upload.mp4');
    
    // Create a small test file if it doesn't exist
    if (!fs.existsSync(testFilePath)) {
      console.log('Creating test file...');
      // Create a 1MB test file
      const buffer = Buffer.alloc(1024 * 1024, 'x');
      fs.writeFileSync(testFilePath, buffer);
    }
    
    console.log(`Test file: ${testFilePath}`);
    
    // Test upload to both services
    console.log('\nTesting uploads...');
    console.log('1. Testing Mixdrop upload...');
    
    try {
      const mixdropResult = await fileHostService['uploadToMixdrop'](testFilePath);
      console.log('Mixdrop upload result:', mixdropResult);
    } catch (error) {
      console.error('Mixdrop upload error:', error);
    }
    
    console.log('\n2. Testing Gofiles upload...');
    
    try {
      const gofilesResult = await fileHostService['uploadToGofiles'](testFilePath);
      console.log('Gofiles upload result:', gofilesResult);
    } catch (error) {
      console.error('Gofiles upload error:', error);
    }
    
    console.log('\n3. Testing uploadToMultipleHosts (should try Mixdrop first)...');
    
    try {
      const results = await fileHostService.uploadToMultipleHosts(testFilePath);
      console.log('Upload results:', results);
    } catch (error) {
      console.error('Multiple hosts upload error:', error);
    }
    
    console.log('\nFile hosting tests completed.');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testFileHosting().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 