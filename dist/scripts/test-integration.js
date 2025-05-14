"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../lib/utils/db");
const streamDetector_1 = __importDefault(require("../lib/services/streamDetector"));
const streamRecorder_1 = __importDefault(require("../lib/services/streamRecorder"));
const schedulerService_1 = __importDefault(require("../lib/services/schedulerService"));
const Performer_1 = __importDefault(require("../lib/models/Performer"));
const Recording_1 = __importDefault(require("../lib/models/Recording"));
const Video_1 = __importDefault(require("../lib/models/Video"));
const logger_1 = require("../lib/utils/logger");
const ffmpeg_1 = require("../lib/utils/ffmpeg");
const helpers_1 = require("../lib/utils/helpers");
/**
 * Test the integration between different services
 */
async function testIntegration() {
    try {
        // Connect to database
        await (0, db_1.connectDB)();
        logger_1.logger.info('Connected to database');
        // Test each component in sequence
        const performer = await testPerformerSetup();
        if (!performer) {
            logger_1.logger.error('Failed to set up performer, aborting test');
            return;
        }
        await testStreamDetection(performer);
        await testRecording(performer);
        await testScheduler();
        logger_1.logger.info('Integration test completed successfully');
    }
    catch (error) {
        logger_1.logger.error('Integration test failed:', error);
    }
    finally {
        // Clean up
        await (0, db_1.disconnectDB)();
        logger_1.logger.info('Disconnected from database');
        process.exit(0);
    }
}
/**
 * Test performer setup
 */
async function testPerformerSetup() {
    try {
        // First, check if we have an active performer
        let performer = await Performer_1.default.findOne({ isActive: true });
        if (!performer) {
            // Create a test performer if none exists
            logger_1.logger.info('No active performer found, creating a test performer');
            performer = await Performer_1.default.create({
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
            logger_1.logger.info(`Created test performer: ${performer._id}`);
        }
        else {
            logger_1.logger.info(`Using existing performer: ${performer.name} (${performer._id})`);
        }
        return performer;
    }
    catch (error) {
        logger_1.logger.error('Error setting up performer:', error);
        return null;
    }
}
/**
 * Test stream detection
 */
async function testStreamDetection(performer) {
    try {
        logger_1.logger.info('Testing stream detection');
        const performerStatus = await streamDetector_1.default.checkPerformerStatus(performer);
        logger_1.logger.info('Stream detection results:');
        for (const platform of performer.platforms) {
            const status = performerStatus.get(platform.platform);
            logger_1.logger.info(`- ${platform.platform}: ${status?.isOnline ? 'Online' : 'Offline'}`);
        }
    }
    catch (error) {
        logger_1.logger.error('Error testing stream detection:', error);
    }
}
/**
 * Test recording functionality
 */
async function testRecording(performer) {
    try {
        logger_1.logger.info('Testing stream recorder with a mock stream');
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
        const recording = await streamRecorder_1.default.startRecording(recordingOptions);
        // Ensure we have a valid recording with an ID
        if (!recording || !recording._id) {
            logger_1.logger.error('Failed to start recording properly');
            return;
        }
        logger_1.logger.info(`Started test recording: ${recording._id}`);
        // Let it record for a bit
        logger_1.logger.info('Recording for 20 seconds...');
        await (0, helpers_1.delay)(20000);
        // Stop recording (with proper type assertion)
        const recordingId = recording._id.toString();
        const stoppedRecording = await streamRecorder_1.default.stopRecording(recordingId);
        logger_1.logger.info(`Stopped recording: ${stoppedRecording?._id}`);
        // Wait for processing to complete
        logger_1.logger.info('Waiting for processing to complete...');
        await (0, helpers_1.delay)(5000);
        // Get updated recording
        const updatedRecording = await Recording_1.default.findById(recordingId);
        if (!updatedRecording) {
            logger_1.logger.error('Recording not found after processing');
            return;
        }
        logger_1.logger.info(`Recording status: ${updatedRecording.status}`);
        logger_1.logger.info(`Recording duration: ${updatedRecording.duration} seconds`);
        logger_1.logger.info(`Recording file: ${updatedRecording.outputPath}`);
        // Check if a video was created
        const video = await Video_1.default.findOne({ recordingId: recordingId });
        if (video) {
            logger_1.logger.info(`Video created: ${video._id}`);
            logger_1.logger.info(`Video title: ${video.title}`);
            logger_1.logger.info(`Video thumbnail: ${video.thumbnail}`);
            logger_1.logger.info(`Video URL: ${video.fileUrl}`);
        }
        else {
            logger_1.logger.warn('No video created for the recording');
        }
        // Test FFmpeg utilities
        await testFfmpeg(updatedRecording);
    }
    catch (error) {
        logger_1.logger.error('Error testing recorder:', error);
    }
}
/**
 * Test FFmpeg utilities
 */
async function testFfmpeg(recording) {
    if (!recording.outputPath) {
        logger_1.logger.warn('Recording has no output path, skipping FFmpeg tests');
        return;
    }
    try {
        logger_1.logger.info('Testing FFmpeg utilities');
        // Get video metadata
        const metadata = await (0, ffmpeg_1.getVideoMetadata)(recording.outputPath);
        logger_1.logger.info('Video metadata:', metadata);
        // Generate thumbnails
        const thumbnails = await (0, ffmpeg_1.generateThumbnails)({
            inputPath: recording.outputPath,
            count: 2
        });
        logger_1.logger.info(`Generated ${thumbnails.length} thumbnails:`);
        thumbnails.forEach((path, i) => {
            logger_1.logger.info(`- Thumbnail ${i + 1}: ${path}`);
        });
    }
    catch (error) {
        logger_1.logger.error('Error testing FFmpeg utilities:', error);
    }
}
/**
 * Test scheduler service
 */
async function testScheduler() {
    try {
        logger_1.logger.info('Testing scheduler service');
        // Start the scheduler
        await schedulerService_1.default.start();
        logger_1.logger.info('Scheduler started');
        // Run a check manually
        logger_1.logger.info('Running stream check');
        await schedulerService_1.default.checkStreams();
        // Let it run for a bit
        logger_1.logger.info('Letting scheduler run for 10 seconds...');
        await (0, helpers_1.delay)(10000);
        // Stop the scheduler
        await schedulerService_1.default.stop();
        logger_1.logger.info('Scheduler stopped');
    }
    catch (error) {
        logger_1.logger.error('Error testing scheduler:', error);
    }
}
// Run the test
testIntegration();
