"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = require("@/lib/utils/logger");
const streamRecorder_1 = __importDefault(require("./streamRecorder"));
const streamDetector_1 = __importDefault(require("./streamDetector"));
const Recording_1 = __importDefault(require("@/lib/models/Recording"));
const Performer_1 = __importDefault(require("@/lib/models/Performer"));
const app_1 = __importDefault(require("@/config/app"));
const helpers_1 = require("@/lib/utils/helpers");
/**
 * Service that schedules recurring tasks:
 * - Checking for active streams
 * - Processing completed recordings
 */
class SchedulerService {
    constructor() {
        this.checkStreamsTask = null;
        this.checkUploadsTask = null;
        this.isRunningState = false;
        this.lastStreamCheckTime = null;
        this.lastUploadCheckTime = null;
    }
    /**
     * Start the scheduler
     */
    async start(options) {
        if (this.isRunningState) {
            logger_1.schedulerLogger.info('Scheduler already running');
            return;
        }
        try {
            logger_1.schedulerLogger.info('Starting scheduler service');
            // Schedule task to check for active streams
            const checkInterval = options?.checkInterval || app_1.default.scheduler.checkInterval;
            this.checkStreamsTask = node_cron_1.default.schedule(checkInterval, async () => {
                logger_1.schedulerLogger.info(`Running scheduled stream check (interval: ${checkInterval})`);
                await this.checkStreams();
                this.lastStreamCheckTime = new Date();
            });
            // Schedule task to process any pending uploads
            const uploadInterval = options?.uploadInterval || app_1.default.scheduler.uploadInterval;
            this.checkUploadsTask = node_cron_1.default.schedule(uploadInterval, async () => {
                logger_1.schedulerLogger.info(`Running scheduled upload check (interval: ${uploadInterval})`);
                await this.checkPendingUploads();
                this.lastUploadCheckTime = new Date();
            });
            // Auto-start initial check if configured
            if (app_1.default.scheduler.enableAutoStart) {
                logger_1.schedulerLogger.info('Auto-starting initial stream check');
                setTimeout(() => this.checkStreams(), 5000);
            }
            this.isRunningState = true;
            logger_1.schedulerLogger.info('Scheduler service started successfully');
        }
        catch (error) {
            logger_1.schedulerLogger.error('Failed to start scheduler service:', error);
            throw error;
        }
    }
    /**
     * Stop the scheduler
     */
    async stop() {
        logger_1.schedulerLogger.info('Stopping scheduler service');
        // Stop cron tasks
        if (this.checkStreamsTask) {
            this.checkStreamsTask.stop();
            this.checkStreamsTask = null;
        }
        if (this.checkUploadsTask) {
            this.checkUploadsTask.stop();
            this.checkUploadsTask = null;
        }
        // Stop any active recordings
        await streamRecorder_1.default.stopAllRecordings();
        this.isRunningState = false;
        logger_1.schedulerLogger.info('Scheduler service stopped');
    }
    /**
     * Check for active streams and start recording if needed
     */
    async checkStreams() {
        try {
            logger_1.schedulerLogger.info('Checking for active performers');
            // Get all active performers
            const performers = await Performer_1.default.find({ isActive: true });
            if (performers.length === 0) {
                logger_1.schedulerLogger.info('No active performers found');
                return { startedRecordings: 0, totalPerformers: 0 };
            }
            logger_1.schedulerLogger.info(`Found ${performers.length} active performers`);
            // Check each performer's status
            const maxConcurrentRecordings = app_1.default.scheduler.maxConcurrentRecordings || 5;
            const activeRecordings = streamRecorder_1.default.getActiveRecordings();
            if (activeRecordings.length >= maxConcurrentRecordings) {
                logger_1.schedulerLogger.warn(`Maximum concurrent recordings (${maxConcurrentRecordings}) reached, skipping stream check`);
                return { startedRecordings: 0, totalPerformers: performers.length };
            }
            const availableSlots = maxConcurrentRecordings - activeRecordings.length;
            logger_1.schedulerLogger.info(`Currently ${activeRecordings.length} active recordings, ${availableSlots} slots available`);
            // Track new recordings so we don't exceed max concurrent
            let startedRecordings = 0;
            for (const performer of performers) {
                // Skip if we've reached the limit
                if (startedRecordings >= availableSlots) {
                    logger_1.schedulerLogger.info(`Reached available recording slots (${availableSlots}), stopping stream check`);
                    break;
                }
                try {
                    const performerStatus = await streamDetector_1.default.checkPerformerStatus(performer);
                    // Check each platform for this performer
                    for (const platform of performer.platforms) {
                        const status = performerStatus.get(platform.platform);
                        // If the performer is online on this platform
                        if (status?.isOnline && status.streamUrl) {
                            logger_1.schedulerLogger.info(`Performer ${performer.name} is online on ${platform.platform}`);
                            // Check if already recording this performer on this platform
                            const existingRecording = await Recording_1.default.findOne({
                                performerId: performer._id,
                                platform: platform.platform,
                                status: { $in: ['scheduled', 'recording'] }
                            });
                            if (existingRecording) {
                                logger_1.schedulerLogger.info(`Already recording ${performer.name} on ${platform.platform} (ID: ${existingRecording._id})`);
                                continue;
                            }
                            // Start a new recording
                            logger_1.schedulerLogger.info(`Starting recording for ${performer.name} on ${platform.platform}`);
                            try {
                                await streamRecorder_1.default.startRecording({
                                    performer,
                                    platform: platform.platform,
                                    channelId: platform.channelId,
                                    streamUrl: status.streamUrl,
                                    maxDuration: app_1.default.recording.maxDuration,
                                    quality: app_1.default.recording.defaultQuality
                                });
                                // Increment counter
                                startedRecordings++;
                                // Update performer's last seen timestamp
                                await Performer_1.default.findByIdAndUpdate(performer._id, {
                                    lastSeen: new Date()
                                });
                                logger_1.schedulerLogger.info(`Recording started successfully for ${performer.name} on ${platform.platform}`);
                            }
                            catch (error) {
                                logger_1.schedulerLogger.error(`Failed to start recording for ${performer.name} on ${platform.platform}:`, error);
                            }
                        }
                        else {
                            logger_1.schedulerLogger.debug(`Performer ${performer.name} is offline on ${platform.platform}`);
                        }
                    }
                }
                catch (error) {
                    logger_1.schedulerLogger.error(`Error checking status for performer ${performer.name}:`, error);
                }
            }
            logger_1.schedulerLogger.info(`Stream check completed, started ${startedRecordings} new recordings`);
            return { startedRecordings, totalPerformers: performers.length };
        }
        catch (error) {
            logger_1.schedulerLogger.error('Error checking streams:', error);
            return { startedRecordings: 0, totalPerformers: 0 };
        }
    }
    /**
     * Check for pending uploads (completed recordings without video URLs)
     *
     * This function simulates the video upload process by generating
     * a fake URL for recordings that have been completed but don't have
     * a video URL yet. In a real application, this would upload the video
     * to a cloud storage provider or media server.
     */
    async checkPendingUploads() {
        try {
            // Find recordings that are completed but don't have a video URL
            const pendingUploads = await Recording_1.default.find({
                status: 'completed',
                videoUrl: { $exists: false }
            });
            if (pendingUploads.length === 0) {
                logger_1.schedulerLogger.debug('No pending uploads found');
                return { processedCount: 0 };
            }
            logger_1.schedulerLogger.info(`Found ${pendingUploads.length} pending uploads`);
            for (const recording of pendingUploads) {
                try {
                    if (!recording.outputPath) {
                        logger_1.schedulerLogger.warn(`Recording ${recording._id} has no output path, skipping upload`);
                        continue;
                    }
                    // In a real application, this would upload the file to a cloud storage
                    // For now, we'll just generate a fake URL
                    const today = (0, helpers_1.formatDate)(new Date(), 'YYYY-MM-DD');
                    const fakeVideoUrl = `/videos/${recording.platform}/${recording._id}/${today}.mp4`;
                    // Update the recording with the video URL
                    await Recording_1.default.findByIdAndUpdate(recording._id, {
                        videoUrl: fakeVideoUrl
                    });
                    logger_1.schedulerLogger.info(`Generated video URL for recording ${recording._id}: ${fakeVideoUrl}`);
                }
                catch (error) {
                    logger_1.schedulerLogger.error(`Error processing upload for recording ${recording._id}:`, error);
                }
            }
            logger_1.schedulerLogger.info(`Upload check completed, processed ${pendingUploads.length} recordings`);
            return { processedCount: pendingUploads.length };
        }
        catch (error) {
            logger_1.schedulerLogger.error('Error checking pending uploads:', error);
            return { processedCount: 0 };
        }
    }
    /**
     * Check if the scheduler is running
     */
    isRunning() {
        return this.isRunningState;
    }
    /**
     * Get active recordings
     */
    getActiveRecordings() {
        return streamRecorder_1.default.getActiveRecordings();
    }
    /**
     * Get active recording count
     */
    getActiveRecordingCount() {
        return this.getActiveRecordings().length;
    }
    /**
     * Get the tasks scheduled
     */
    getTasks() {
        const tasks = [];
        if (this.checkStreamsTask)
            tasks.push('checkStreams');
        if (this.checkUploadsTask)
            tasks.push('checkUploads');
        return tasks;
    }
    /**
     * Get the last run timestamps for all tasks
     */
    getLastRunTimestamps() {
        return {
            checkStreams: this.lastStreamCheckTime,
            checkUploads: this.lastUploadCheckTime
        };
    }
    /**
     * Get the check interval cron expression
     */
    getCheckInterval() {
        return app_1.default.scheduler.checkInterval;
    }
    /**
     * Get the upload interval cron expression
     */
    getUploadInterval() {
        return app_1.default.scheduler.uploadInterval;
    }
    /**
     * Run stream check immediately
     */
    async checkLiveStreams() {
        return this.checkStreams();
    }
    /**
     * Run upload check immediately
     */
    async handlePendingUploads() {
        return this.checkPendingUploads();
    }
}
exports.default = new SchedulerService();
