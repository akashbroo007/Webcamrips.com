"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateThumbnails = generateThumbnails;
exports.getVideoMetadata = getVideoMetadata;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const logger_1 = require("./logger");
const app_1 = __importDefault(require("../../config/app"));
const paths_1 = require("./paths");
/**
 * Generate thumbnails from a video file using FFmpeg
 * @param options Thumbnail generation options
 * @returns Promise resolving to an array of generated thumbnail paths
 */
async function generateThumbnails(options) {
    const { inputPath, timeOffset = '00:00:05', // Default to 5 seconds into the video
    width = 320, count = app_1.default.recording.thumbnailCount || 3 } = options;
    // If output path is not provided, use default thumbnails directory
    let outputPath = options.outputPath;
    if (!outputPath) {
        const inputFilename = path_1.default.basename(inputPath, path_1.default.extname(inputPath));
        outputPath = path_1.default.join(app_1.default.storage.thumbnailsDir, `${inputFilename}-thumb-%d.jpg`);
    }
    // Ensure the output directory exists
    (0, paths_1.ensureDirectoryExists)(path_1.default.dirname(outputPath));
    // If we need multiple thumbnails, we'll generate them at different positions
    const thumbnailPaths = [];
    if (count === 1) {
        // Single thumbnail at specified offset
        const singleOutputPath = outputPath.replace(/%d/, '1');
        await generateSingleThumbnail(inputPath, singleOutputPath, timeOffset, width);
        thumbnailPaths.push(singleOutputPath);
    }
    else {
        // Multiple thumbnails at different positions
        for (let i = 0; i < count; i++) {
            // Calculate position based on thumbnail index
            // For example, for 3 thumbnails: 10%, 50%, 90% of the video
            const percent = Math.round(((i + 1) / (count + 1)) * 100);
            const position = `${percent}%`;
            const currentOutputPath = outputPath.replace(/%d/, (i + 1).toString());
            await generateSingleThumbnail(inputPath, currentOutputPath, position, width);
            thumbnailPaths.push(currentOutputPath);
        }
    }
    return thumbnailPaths;
}
/**
 * Generate a single thumbnail using FFmpeg
 * @param inputPath Path to the input video file
 * @param outputPath Path for the output thumbnail
 * @param timeOffset Time offset for the thumbnail (e.g. "00:00:05" or "50%")
 * @param width Width of the thumbnail
 * @returns Promise that resolves when the thumbnail is generated
 */
async function generateSingleThumbnail(inputPath, outputPath, timeOffset, width) {
    return new Promise((resolve, reject) => {
        const args = [
            '-i', inputPath,
            '-ss', timeOffset,
            '-vframes', '1',
            '-vf', `scale=${width}:-1`,
            '-q:v', '2', // High quality
            outputPath
        ];
        logger_1.logger.info(`Generating thumbnail with FFmpeg: ffmpeg ${args.join(' ')}`);
        const process = (0, child_process_1.spawn)('ffmpeg', args);
        process.stderr.on('data', (data) => {
            logger_1.logger.debug(`[FFmpeg] ${data.toString().trim()}`);
        });
        process.on('close', (code) => {
            if (code === 0) {
                logger_1.logger.info(`Thumbnail generated successfully: ${outputPath}`);
                resolve();
            }
            else {
                const error = new Error(`FFmpeg process exited with code ${code}`);
                logger_1.logger.error(`Failed to generate thumbnail: ${error.message}`);
                reject(error);
            }
        });
        process.on('error', (error) => {
            logger_1.logger.error(`FFmpeg process error: ${error.message}`);
            reject(error);
        });
    });
}
/**
 * Extract video metadata using FFmpeg
 * @param filePath Path to the video file
 * @returns Promise resolving to video metadata
 */
async function getVideoMetadata(filePath) {
    return new Promise((resolve, reject) => {
        const args = [
            '-i', filePath,
            '-hide_banner'
        ];
        logger_1.logger.debug(`Getting video metadata: ffmpeg ${args.join(' ')}`);
        const process = (0, child_process_1.spawn)('ffmpeg', args);
        let output = '';
        process.stderr.on('data', (data) => {
            output += data.toString();
        });
        process.on('close', (code) => {
            try {
                // Extract duration using regex
                const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/);
                if (durationMatch) {
                    const hours = parseInt(durationMatch[1], 10);
                    const minutes = parseInt(durationMatch[2], 10);
                    const seconds = parseInt(durationMatch[3], 10);
                    const milliseconds = parseInt(durationMatch[4], 10) * 10;
                    const durationInSeconds = hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
                    // Extract resolution
                    const videoStreamMatch = output.match(/Stream.*Video:.*, (\d+)x(\d+)/);
                    const width = videoStreamMatch ? parseInt(videoStreamMatch[1], 10) : undefined;
                    const height = videoStreamMatch ? parseInt(videoStreamMatch[2], 10) : undefined;
                    // Extract codec
                    const codecMatch = output.match(/Video: (\w+)/);
                    const codec = codecMatch ? codecMatch[1] : undefined;
                    // Extract bitrate
                    const bitrateMatch = output.match(/bitrate: (\d+) kb\/s/);
                    const bitrate = bitrateMatch ? parseInt(bitrateMatch[1], 10) : undefined;
                    resolve({
                        format: 'unknown',
                        size: 0,
                        resolution: `${width}x${height}`,
                        duration: durationInSeconds,
                        width,
                        height,
                        codec,
                        bitrate
                    });
                }
                else {
                    resolve({
                        format: 'unknown',
                        size: 0,
                        resolution: 'unknown',
                        duration: undefined,
                        width: undefined,
                        height: undefined,
                        codec: undefined,
                        bitrate: undefined
                    });
                }
            }
            catch (error) {
                logger_1.logger.error(`Error parsing FFmpeg output: ${error}`);
                reject(error);
            }
        });
        process.on('error', (error) => {
            logger_1.logger.error(`FFmpeg process error: ${error.message}`);
            reject(error);
        });
    });
}
