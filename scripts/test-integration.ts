import { connectDB, disconnectDB } from '../lib/utils/db';
import streamDetector from '../lib/services/streamDetector';
import streamRecorder from '../lib/services/streamRecorder';
import schedulerService from '../lib/services/schedulerService';
import Performer, { IPerformer } from '../lib/models/Performer';
import Recording, { IRecording } from '../lib/models/Recording';
import Video from '../lib/models/Video';
import { logger } from '../lib/utils/logger';
import { getVideoMetadata, generateThumbnails } from '../lib/utils/ffmpeg';
import { delay } from '../lib/utils/helpers';

/**
 * Test the integration between different services
 */
async function testIntegration() {
  try {
    // Connect to database
    await connectDB();
    logger.info('Connected to database');

    // Test each component in sequence
    const performer = await testPerformerSetup();
    if (!performer) {
      logger.error('Failed to set up performer, aborting test');
      return;
    }

    await testStreamDetection(performer);
    await testRecording(performer);
    await testScheduler();

    logger.info('Integration test completed successfully');
  } catch (error) {
    logger.error('Integration test failed:', error);
  } finally {
    // Clean up
    await disconnectDB();
    logger.info('Disconnected from database');
    process.exit(0);
  }
}

/**
 * Test performer setup
 */
async function testPerformerSetup(): Promise<IPerformer | null> {
  try {
    // First, check if we have an active performer
    let performer = await Performer.findOne({ isActive: true });
    
    if (!performer) {
      // Create a test performer if none exists
      logger.info('No active performer found, creating a test performer');
      performer = await Performer.create({
        name: 'TestPerformer',
        isActive: true,
        platforms: [
          {
            platform: 'Chaturbate',
            channelId: 'test_channel',
            url: 'https://chaturbate.com/test_channel/'
          }
        ],
        tags: ['test', 'integration']
      });
      logger.info(`Created test performer: ${performer._id}`);
    } else {
      logger.info(`Using existing performer: ${performer.name} (${performer._id})`);
    }
    
    return performer;
  } catch (error) {
    logger.error('Error setting up performer:', error);
    return null;
  }
}

/**
 * Test stream detection
 */
async function testStreamDetection(performer: IPerformer): Promise<void> {
  try {
    logger.info('Testing stream detection');
    const performerStatus = await streamDetector.checkPerformerStatus(performer);
    
    logger.info('Stream detection results:');
    for (const platform of performer.platforms) {
      const status = performerStatus.get(platform.platform);
      logger.info(`- ${platform.platform}: ${status?.isOnline ? 'Online' : 'Offline'}`);
    }
  } catch (error) {
    logger.error('Error testing stream detection:', error);
  }
}

/**
 * Test recording functionality
 */
async function testRecording(performer: IPerformer): Promise<void> {
  try {
    logger.info('Testing stream recorder with a mock stream');
    
    // Create a test recording using YouTube as a safe test source
    const recordingOptions = {
      performer,
      platform: 'Chaturbate',
      channelId: 'test_channel',
      // Use a short, reliable YouTube video for testing
      streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
      maxDuration: 1 // 1 minute max
    };
    
    // Start recording
    const recording = await streamRecorder.startRecording(recordingOptions);
    
    // Ensure we have a valid recording with an ID
    if (!recording || !recording._id) {
      logger.error('Failed to start recording properly');
      return;
    }
    
    logger.info(`Started test recording: ${recording._id}`);
    
    // Let it record for a bit
    logger.info('Recording for 20 seconds...');
    await delay(20000);
    
    // Stop recording (with proper type assertion)
    const recordingId = recording._id.toString();
    const stoppedRecording = await streamRecorder.stopRecording(recordingId);
    logger.info(`Stopped recording: ${stoppedRecording?._id}`);
    
    // Wait for processing to complete
    logger.info('Waiting for processing to complete...');
    await delay(5000);
    
    // Get updated recording
    const updatedRecording = await Recording.findById(recordingId);
    if (!updatedRecording) {
      logger.error('Recording not found after processing');
      return;
    }
    
    logger.info(`Recording status: ${updatedRecording.status}`);
    logger.info(`Recording duration: ${updatedRecording.duration} seconds`);
    logger.info(`Recording file: ${updatedRecording.filePath}`);
    
    // Check if a video was created
    const video = await Video.findOne({ recordingId: recordingId });
    
    if (video) {
      logger.info(`Video created: ${video._id}`);
      logger.info(`Video title: ${video.title}`);
      logger.info(`Video thumbnail: ${video.thumbnail}`);
      logger.info(`Video URL: ${video.gofilesUrl || video.mixdropUrl}`);
    } else {
      logger.warn('No video created for the recording');
    }
    
    // Test FFmpeg utilities
    await testFfmpeg(updatedRecording);
  } catch (error) {
    logger.error('Error testing recorder:', error);
  }
}

/**
 * Test FFmpeg utilities
 */
async function testFfmpeg(recording: IRecording): Promise<void> {
  if (!recording.filePath) {
    logger.warn('Recording has no output path, skipping FFmpeg tests');
    return;
  }
  
  try {
    logger.info('Testing FFmpeg utilities');
    
    // Get video metadata
    const metadata = await getVideoMetadata(recording.filePath);
    logger.info('Video metadata:', metadata);
    
    // Generate thumbnails
    const thumbnails = await generateThumbnails({
      inputPath: recording.filePath,
      count: 2
    });
    logger.info(`Generated ${thumbnails.length} thumbnails:`);
    thumbnails.forEach((path, i) => {
      logger.info(`- Thumbnail ${i+1}: ${path}`);
    });
  } catch (error) {
    logger.error('Error testing FFmpeg utilities:', error);
  }
}

/**
 * Test scheduler service
 */
async function testScheduler(): Promise<void> {
  try {
    logger.info('Testing scheduler service');
    
    // Start the scheduler
    await schedulerService.start();
    logger.info('Scheduler started');
    
    // Run a check manually
    logger.info('Running stream check');
    await schedulerService.checkStreams();
    
    // Let it run for a bit
    logger.info('Letting scheduler run for 10 seconds...');
    await delay(10000);
    
    // Stop the scheduler
    await schedulerService.stop();
    logger.info('Scheduler stopped');
  } catch (error) {
    logger.error('Error testing scheduler:', error);
  }
}

// Run the test
testIntegration(); 