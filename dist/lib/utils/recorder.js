"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordingProcess = void 0;
exports.startRecording = startRecording;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("./logger");
const app_1 = __importDefault(require("@/config/app"));
const platforms_1 = __importDefault(require("@/config/platforms"));
const helpers_1 = require("./helpers");
/**
 * Class for handling recording processes
 */
class RecordingProcess {
    constructor(options) {
        this.process = null;
        this.started = new Date();
        this.maxDurationTimer = null;
        this.forceKilled = false;
        this.processClosed = false;
        this.outputPath = options.outputPath;
        this.recordingOptions = options;
    }
    /**
     * Start the recording process using yt-dlp
     */
    async startWithYtdlp() {
        const { platform, streamUrl, outputPath, quality = 'best', userAgent, cookies, onStdout, onStderr } = this.recordingOptions;
        // Get platform-specific configuration
        const platformConfig = platforms_1.default[platform] || {};
        // Build arguments for yt-dlp
        const args = [
            streamUrl,
            '--no-playlist',
            '--format', quality,
            '-o', outputPath
        ];
        // Add platform-specific flags
        if (platformConfig.ytdlpFlags) {
            args.push(...platformConfig.ytdlpFlags);
        }
        // Add user agent if provided
        if (userAgent || platformConfig.userAgent) {
            args.push('--user-agent', userAgent || platformConfig.userAgent);
        }
        // Add cookies if enabled
        if (cookies || platformConfig.cookies) {
            // Check if we have a Chrome cookies path
            if (app_1.default.cookies.chrome) {
                args.push('--cookies-from-browser', `chrome:${app_1.default.cookies.chrome}`);
            }
            else if (app_1.default.cookies.firefox) {
                args.push('--cookies-from-browser', `firefox:${app_1.default.cookies.firefox}`);
            }
            else {
                args.push('--cookies-from-browser', 'chrome');
            }
        }
        // Log the command
        logger_1.recordingLogger.info(`Starting yt-dlp with: yt-dlp ${args.join(' ')}`);
        // Start the process
        const process = (0, child_process_1.spawn)('yt-dlp', args);
        this.process = process;
        // Set up output handlers
        process.stdout.on('data', (data) => {
            const output = data.toString();
            if (onStdout)
                onStdout(output);
            logger_1.recordingLogger.debug(`[yt-dlp] stdout: ${output.trim()}`);
        });
        process.stderr.on('data', (data) => {
            const output = data.toString();
            if (onStderr)
                onStderr(output);
            logger_1.recordingLogger.debug(`[yt-dlp] stderr: ${output.trim()}`);
        });
        // Set up error handler
        process.on('error', (error) => {
            logger_1.recordingLogger.error(`yt-dlp process error: ${error.message}`);
        });
        return process;
    }
    /**
     * Start the recording process using streamlink as a fallback
     */
    async startWithStreamlink() {
        const { platform, streamUrl, outputPath, quality = 'best', userAgent, onStdout, onStderr } = this.recordingOptions;
        // Get platform-specific configuration
        const platformConfig = platforms_1.default[platform] || {};
        // Build arguments for streamlink
        const args = [
            streamUrl,
            quality,
            '-o', outputPath,
            '--force'
        ];
        // Add platform-specific flags
        if (platformConfig.streamlinkFlags) {
            args.push(...platformConfig.streamlinkFlags);
        }
        // Log the command
        logger_1.recordingLogger.info(`Starting streamlink with: streamlink ${args.join(' ')}`);
        // Start the process
        const process = (0, child_process_1.spawn)('streamlink', args);
        this.process = process;
        // Set up output handlers
        process.stdout.on('data', (data) => {
            const output = data.toString();
            if (onStdout)
                onStdout(output);
            logger_1.recordingLogger.debug(`[streamlink] stdout: ${output.trim()}`);
        });
        process.stderr.on('data', (data) => {
            const output = data.toString();
            if (onStderr)
                onStderr(output);
            logger_1.recordingLogger.debug(`[streamlink] stderr: ${output.trim()}`);
        });
        // Set up error handler
        process.on('error', (error) => {
            logger_1.recordingLogger.error(`streamlink process error: ${error.message}`);
        });
        return process;
    }
    /**
     * Start the recording
     */
    async start() {
        const { maxDuration, onExit } = this.recordingOptions;
        try {
            // First try yt-dlp
            if (app_1.default.recording.useYtdlp) {
                try {
                    this.process = await this.startWithYtdlp();
                }
                catch (error) {
                    logger_1.recordingLogger.error(`yt-dlp failed, falling back to streamlink: ${error}`);
                    // If yt-dlp fails and streamlink is enabled, try that
                    if (app_1.default.recording.useStreamlink) {
                        this.process = await this.startWithStreamlink();
                    }
                    else {
                        throw error;
                    }
                }
            }
            else if (app_1.default.recording.useStreamlink) {
                // If yt-dlp is disabled, try streamlink directly
                this.process = await this.startWithStreamlink();
            }
            else {
                throw new Error('No recording method enabled');
            }
            // Set up close handler
            this.process.on('close', (code) => {
                this.processClosed = true;
                // Clear max duration timer if it exists
                if (this.maxDurationTimer) {
                    clearTimeout(this.maxDurationTimer);
                    this.maxDurationTimer = null;
                }
                logger_1.recordingLogger.info(`Recording process exited with code ${code}`);
                // Call the onExit callback if provided
                if (onExit)
                    onExit(code);
            });
            // Set max duration timer if provided
            if (maxDuration) {
                const durationMs = maxDuration * 60 * 1000; // Convert to milliseconds
                this.maxDurationTimer = setTimeout(() => {
                    logger_1.recordingLogger.info(`Max duration of ${maxDuration} minutes reached, stopping recording`);
                    this.stop();
                }, durationMs);
            }
            // Mark as started
            this.started = new Date();
        }
        catch (error) {
            logger_1.recordingLogger.error(`Failed to start recording: ${error.message}`);
            throw error;
        }
    }
    /**
     * Stop the recording
     */
    async stop() {
        if (!this.process || this.processClosed) {
            return;
        }
        // Mark as force killed
        this.forceKilled = true;
        // Send SIGTERM to the process
        this.process.kill('SIGTERM');
        // Give it a moment to shut down gracefully
        await (0, helpers_1.delay)(1000);
        // If it's still running, force kill it
        if (!this.processClosed) {
            this.process.kill('SIGKILL');
        }
    }
    /**
     * Get the result of the recording
     */
    getResult() {
        // Check if the output file exists
        const fileExists = fs_1.default.existsSync(this.outputPath);
        const partFileExists = fs_1.default.existsSync(`${this.outputPath}.part`);
        // If the file doesn't exist but the part file does, try to rename it
        if (!fileExists && partFileExists) {
            try {
                fs_1.default.renameSync(`${this.outputPath}.part`, this.outputPath);
                logger_1.recordingLogger.info(`Renamed .part file to ${this.outputPath}`);
            }
            catch (error) {
                logger_1.recordingLogger.error(`Failed to rename .part file: ${error}`);
            }
        }
        // Check the file again after potential rename
        const finalFileExists = fs_1.default.existsSync(this.outputPath);
        if (finalFileExists) {
            // Get file stats
            const stats = fs_1.default.statSync(this.outputPath);
            const fileSize = stats.size;
            // Calculate approximate duration based on start and end time
            const endTime = new Date();
            const durationSeconds = Math.floor((endTime.getTime() - this.started.getTime()) / 1000);
            return {
                success: true,
                fileSize,
                duration: durationSeconds,
                outputPath: this.outputPath
            };
        }
        else {
            // Return error if no file was produced
            return {
                success: false,
                error: new Error('No output file was produced')
            };
        }
    }
    /**
     * Check if the recording is still active
     */
    isActive() {
        return !this.processClosed && this.process !== null;
    }
}
exports.RecordingProcess = RecordingProcess;
/**
 * Create and start a new recording
 */
async function startRecording(options) {
    const recordingProcess = new RecordingProcess(options);
    await recordingProcess.start();
    return recordingProcess;
}
