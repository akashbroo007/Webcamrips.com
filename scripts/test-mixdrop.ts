import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { connectDB } from '../lib/utils/db';
import { logger } from '../lib/utils/logger';

// Load environment variables
dotenv.config({ path: '.env.local' });

/**
 * Test script for Mixdrop integration
 */
async function testMixdropIntegration() {
  try {
    // Connect to database
    logger.info('Connecting to database...');
    await connectDB();
    logger.info('Connected to database');
    
    // Import models
    const Video = (await import('../lib/models/Video')).default;
    
    // Find videos with Mixdrop URLs
    const mixdropVideos = await Video.find({ mixdropUrl: { $exists: true, $ne: null } })
      .limit(5)
      .sort({ createdAt: -1 });
    
    logger.info(`Found ${mixdropVideos.length} videos with Mixdrop URLs`);
    
    if (mixdropVideos.length > 0) {
      // Display video details
      mixdropVideos.forEach((video, index) => {
        logger.info(`\nVideo ${index + 1}:`);
        logger.info(`- Title: ${video.title}`);
        logger.info(`- Mixdrop URL: ${video.mixdropUrl}`);
        logger.info(`- File URL (virtual): ${video.fileUrl}`);
        logger.info(`- Views: ${video.views}`);
        logger.info(`- Duration: ${video.formattedDuration}`);
      });
    } else {
      // Create a test video with Mixdrop URL
      logger.info('Creating a test video with Mixdrop URL...');
      
      // Find or create a performer
      const Performer = (await import('../lib/models/Performer')).default;
      let performer = await Performer.findOne();
      
      if (!performer) {
        performer = new Performer({
          name: 'Test Performer',
          platform: 'test'
        });
        await performer.save();
      }
      
      // Create a test video
      const testVideo = new Video({
        title: 'Test Mixdrop Video',
        description: 'This is a test video for Mixdrop integration',
        mixdropUrl: 'https://mixdrop.co/f/example123',
        gofilesUrl: null,
        duration: 300,
        views: 0,
        performer: performer._id,
        platform: 'test',
        tags: ['test', 'mixdrop']
      });
      
      await testVideo.save();
      logger.info('Test video created successfully');
      logger.info(`- ID: ${testVideo._id}`);
      logger.info(`- Mixdrop URL: ${testVideo.mixdropUrl}`);
      logger.info(`- File URL (virtual): ${testVideo.fileUrl}`);
    }
    
    // Test fileUrl virtual
    logger.info('\nTesting fileUrl virtual property...');
    
    const testUrls = [
      'https://mixdrop.co/f/abc123',
      'https://mixdrop.co/e/abc123',
      'mixdrop.co/f/abc123',
      'http://mixdrop.co/f/abc123'
    ];
    
    const VideoClass = (await import('../lib/models/Video')).default;
    for (const url of testUrls) {
      const tempVideo = new VideoClass({
        title: 'Temp',
        mixdropUrl: url,
        gofilesUrl: null
      });
      
      logger.info(`Input URL: ${url}`);
      logger.info(`Output URL: ${tempVideo.fileUrl}`);
    }
    
    logger.info('\nMixdrop integration test completed successfully');
  } catch (error) {
    logger.error('Test failed:', error);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    logger.info('Database connection closed');
  }
}

// Run the test
testMixdropIntegration().catch(error => {
  logger.error('Unhandled error:', error);
  process.exit(1);
}); 