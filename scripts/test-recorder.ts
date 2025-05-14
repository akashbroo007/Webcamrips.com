#!/usr/bin/env node

import { StreamDetectorService } from '../lib/services/StreamDetectorService';

async function main() {
  try {
    // Initialize services
    const streamDetector = new StreamDetectorService();

    // Test stream detection
    console.log('\nTesting stream detection...');
    await streamDetector.initialize();
    
    // Test with a public live stream URL
    const testUrl = 'https://stripchat.global/IsabellaEtthan';
    
    console.log(`\nTesting URL: ${testUrl}`);
    const streamUrl = await streamDetector.detectStream(testUrl);
    if (streamUrl) {
      console.log('Stream detected!');
      console.log('Stream URL:', streamUrl);
    } else {
      console.log('No stream detected');
    }

    await streamDetector.cleanup();
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    console.log('\nTest completed');
  }
}

main(); 