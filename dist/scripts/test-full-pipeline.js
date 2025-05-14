"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env.local
dotenv_1.default.config({ path: '.env.local' });
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const child_process_2 = require("child_process");
const paths_1 = require("../lib/utils/paths");
const execPromise = (0, util_1.promisify)(child_process_2.exec);
// Configure output directories with platform-independent path handling
const RECORDINGS_DIR = path_1.default.join(process.cwd(), 'recordings', 'direct');
const THUMBNAILS_DIR = path_1.default.join(process.cwd(), 'public', 'thumbnails');
// Use the imported function instead of redefining
// Create all necessary directories recursively to ensure they exist
// Ensure directories exist before starting
[RECORDINGS_DIR, THUMBNAILS_DIR].forEach(paths_1.ensureDirectoryExists);
// Supported video file extensions to check
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mkv', '.ts', '.flv'];
/**
 * Extract video metadata using FFmpeg
 */
async function getVideoMetadata(filePath) {
    try {
        // Use ffprobe to get video metadata in JSON format
        const { stdout } = await execPromise(`ffprobe -v error -show_entries format=duration -show_entries stream=width,height -of json "${filePath}"`);
        const metadata = JSON.parse(stdout);
        // Extract relevant information
        const streams = metadata.streams || [];
        const videoStream = streams.find((s) => s.width && s.height);
        const format = metadata.format || {};
        return {
            duration: format.duration ? parseFloat(format.duration) : undefined,
            width: videoStream?.width,
            height: videoStream?.height,
            resolution: videoStream ? `${videoStream.width}x${videoStream.height}` : undefined
        };
    }
    catch (error) {
        console.log(`⚠️ Could not extract metadata: ${error}`);
        return {};
    }
}
/**
 * Check if a file exists with any of the given extensions
 */
function findFileWithExtensions(basePath, extensions) {
    const directory = path_1.default.dirname(basePath);
    const baseFilename = path_1.default.basename(basePath, path_1.default.extname(basePath));
    // Check if exact file exists first
    if (fs_1.default.existsSync(basePath)) {
        return basePath;
    }
    // Try all extensions
    for (const ext of extensions) {
        const filePath = path_1.default.join(directory, `${baseFilename}${ext}`);
        if (fs_1.default.existsSync(filePath)) {
            return filePath;
        }
    }
    // Check for .part files
    for (const ext of extensions) {
        const partFilePath = path_1.default.join(directory, `${baseFilename}${ext}.part`);
        if (fs_1.default.existsSync(partFilePath)) {
            return partFilePath;
        }
    }
    return null;
}
/**
 * Record a stream using yt-dlp with enhanced error handling and fallbacks
 */
async function recordStream(streamUrl, outputName, duration = 30) {
    const startTime = new Date();
    console.log(`🕒 Recording started at: ${startTime.toISOString()}`);
    // Create a timestamped filename
    const timestamp = startTime.toISOString().replace(/:/g, '-');
    const outputFilename = `${outputName}-${timestamp}.mp4`;
    const outputPath = path_1.default.join(RECORDINGS_DIR, outputFilename);
    console.log(`📹 Starting recording of ${streamUrl} for ${duration} seconds...`);
    console.log(`💾 Output file will be saved to: ${outputPath}`);
    // Format arguments for yt-dlp with improved format selection
    const args = [
        streamUrl,
        // Better format selection to avoid the warning
        '-f', 'bestvideo+bestaudio/best',
        // Properly quote and escape the output path
        '-o', outputPath.replace(/\\/g, '/'),
        // Don't create .part files
        '--no-part',
        // Don't try to download playlists
        '--no-playlist',
        // Add a user agent to avoid blocking
        '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        // Continue on download errors
        '--ignore-errors',
        // Show all output for debugging
        '--verbose'
    ];
    // Log the exact command for manual testing
    const manualCommand = `yt-dlp "${streamUrl}" -o "${outputPath.replace(/\\/g, '/')}" -f "bestvideo+bestaudio/best" --no-part --no-playlist`;
    console.log(`🧪 Manual test command: ${manualCommand}`);
    const fullCommand = `yt-dlp ${args.join(' ')}`;
    console.log(`🔄 Running full command: ${fullCommand}`);
    return new Promise((resolve) => {
        try {
            const ytdlpProcess = (0, child_process_1.spawn)('yt-dlp', args);
            // Collect stdout for debugging
            let stdoutChunks = [];
            let stderrChunks = [];
            // Set up logging for the process with better formatting
            ytdlpProcess.stdout.on('data', (data) => {
                const output = data.toString().trim();
                if (output) {
                    console.log(`[yt-dlp] ${output}`);
                    stdoutChunks.push(output);
                }
            });
            ytdlpProcess.stderr.on('data', (data) => {
                const output = data.toString().trim();
                if (output) {
                    console.log(`[yt-dlp stderr] ${output}`);
                    stderrChunks.push(output);
                }
            });
            // Set timeout to kill the process after duration seconds
            const timeout = setTimeout(() => {
                console.log(`⏱️ Recording for ${duration} seconds completed, stopping...`);
                ytdlpProcess.kill('SIGTERM');
            }, duration * 1000);
            ytdlpProcess.on('close', async (code) => {
                clearTimeout(timeout);
                const endTime = new Date();
                const recordingDuration = (endTime.getTime() - startTime.getTime()) / 1000;
                console.log(`🕒 Recording ended at: ${endTime.toISOString()}`);
                console.log(`⏱️ Actual recording duration: ${recordingDuration.toFixed(2)} seconds`);
                console.log(`📋 yt-dlp process exited with code: ${code}`);
                // Check for output file with all possible extensions
                const actualFilePath = findFileWithExtensions(outputPath, VIDEO_EXTENSIONS);
                if (actualFilePath) {
                    const isPart = actualFilePath.endsWith('.part');
                    const stats = fs_1.default.statSync(actualFilePath);
                    const fileSizeInMB = stats.size / (1024 * 1024);
                    console.log(`✅ ${isPart ? 'Partial' : 'Complete'} recording found: ${actualFilePath}`);
                    console.log(`📊 File size: ${fileSizeInMB.toFixed(2)} MB`);
                    // Handle .part files by renaming if needed
                    let finalPath = actualFilePath;
                    if (isPart) {
                        const newPath = actualFilePath.replace('.part', '');
                        try {
                            fs_1.default.renameSync(actualFilePath, newPath);
                            console.log(`🔄 Renamed partial file to: ${newPath}`);
                            finalPath = newPath;
                        }
                        catch (error) {
                            console.log(`⚠️ Could not rename partial file: ${error}`);
                        }
                    }
                    // Extract metadata if file exists and is not empty
                    if (stats.size > 0) {
                        try {
                            console.log(`🔍 Extracting metadata from: ${finalPath}`);
                            const metadata = await getVideoMetadata(finalPath);
                            if (metadata.duration) {
                                console.log(`⏱️ Video duration: ${metadata.duration.toFixed(2)} seconds`);
                            }
                            if (metadata.resolution) {
                                console.log(`📏 Video resolution: ${metadata.resolution}`);
                            }
                            resolve({
                                success: true,
                                filePath: finalPath,
                                fileSize: stats.size,
                                duration: metadata.duration,
                                resolution: metadata.resolution,
                                isPart: isPart
                            });
                        }
                        catch (error) {
                            console.log(`⚠️ Error extracting metadata: ${error}`);
                            resolve({
                                success: true,
                                filePath: finalPath,
                                fileSize: stats.size,
                                isPart: isPart
                            });
                        }
                    }
                    else {
                        console.log(`⚠️ File exists but is empty (0 bytes)`);
                        resolve({
                            success: false,
                            filePath: finalPath,
                            fileSize: 0,
                            isPart: isPart
                        });
                    }
                }
                else {
                    console.log(`❌ No output file found at: ${outputPath}`);
                    console.log(`🔍 Searched for extensions: ${VIDEO_EXTENSIONS.join(', ')}`);
                    console.log(`📋 Directory content of ${RECORDINGS_DIR}:`);
                    try {
                        const dirFiles = fs_1.default.readdirSync(RECORDINGS_DIR);
                        dirFiles.forEach(file => {
                            const filePath = path_1.default.join(RECORDINGS_DIR, file);
                            const stats = fs_1.default.statSync(filePath);
                            console.log(`- ${file} (${stats.size} bytes)`);
                        });
                    }
                    catch (error) {
                        console.log(`⚠️ Could not read directory: ${error}`);
                    }
                    console.log('📋 Last yt-dlp output:');
                    if (stdoutChunks.length > 0) {
                        console.log(stdoutChunks.slice(-5).join('\n'));
                    }
                    console.log('📋 Last yt-dlp error output:');
                    if (stderrChunks.length > 0) {
                        console.log(stderrChunks.slice(-5).join('\n'));
                    }
                    resolve({
                        success: false,
                        filePath: '',
                    });
                }
            });
        }
        catch (error) {
            console.error(`❌ Failed to spawn yt-dlp process: ${error}`);
            resolve({
                success: false,
                filePath: '',
            });
        }
    });
}
/**
 * Generate thumbnail for the recorded video
 */
async function generateThumbnail(videoPath) {
    const thumbnailPath = path_1.default.join(THUMBNAILS_DIR, `${path_1.default.basename(videoPath, path_1.default.extname(videoPath))}.jpg`);
    return new Promise((resolve) => {
        console.log(`🖼️ Generating thumbnail for ${videoPath}...`);
        // Use ffmpeg to generate thumbnail at 5 seconds
        const args = [
            '-y', // Overwrite output files without asking
            '-i', videoPath,
            '-ss', '5',
            '-vframes', '1',
            '-vf', 'scale=640:-1',
            '-q:v', '2',
            thumbnailPath
        ];
        console.log(`🔄 Running command: ffmpeg ${args.join(' ')}`);
        try {
            const ffmpegProcess = (0, child_process_1.spawn)('ffmpeg', args);
            ffmpegProcess.stdout.on('data', (data) => {
                console.log(`[ffmpeg] ${data.toString().trim()}`);
            });
            ffmpegProcess.stderr.on('data', (data) => {
                console.log(`[ffmpeg stderr] ${data.toString().trim()}`);
            });
            ffmpegProcess.on('close', (code) => {
                if (code === 0) {
                    console.log(`✅ Thumbnail generated successfully at ${thumbnailPath}`);
                    if (fs_1.default.existsSync(thumbnailPath)) {
                        const stats = fs_1.default.statSync(thumbnailPath);
                        console.log(`📊 Thumbnail size: ${stats.size} bytes`);
                        resolve(thumbnailPath);
                    }
                    else {
                        console.log(`⚠️ Thumbnail file not found after generation`);
                        resolve(null);
                    }
                }
                else {
                    console.error(`❌ ffmpeg process exited with code ${code}`);
                    resolve(null);
                }
            });
        }
        catch (error) {
            console.error(`❌ Failed to spawn ffmpeg process: ${error}`);
            resolve(null);
        }
    });
}
/**
 * Main function to run the test
 */
async function main() {
    try {
        // Parse command line arguments
        const args = process.argv.slice(2);
        const url = args[0] || 'https://www.youtube.com/watch?v=jfKfPfyJRdk'; // Default to a reliable test stream
        // Extract options
        const durationArg = args.find(arg => arg.startsWith('--duration='))?.split('=')[1];
        const duration = durationArg ? parseInt(durationArg, 10) : 5; // Default to 5 seconds
        const nameArg = args.find(arg => arg.startsWith('--name='))?.split('=')[1];
        const name = nameArg || 'test-stream';
        console.log(`
┌─────────────────────────────────────────────┐
│      WEBCAMRIPS FULL PIPELINE TEST          │
└─────────────────────────────────────────────┘
`);
        console.log(`🎯 Target URL: ${url}`);
        console.log(`⏱️ Duration: ${duration} seconds`);
        console.log(`📂 Output Name: ${name}`);
        console.log(`📁 Recordings Directory: ${RECORDINGS_DIR}`);
        console.log('');
        // Step 1: Record the stream
        console.log('📹 Step 1: Recording stream...');
        const recordingResult = await recordStream(url, name, duration);
        // Step 2: Generate thumbnail if recording was successful
        if (recordingResult.success && fs_1.default.existsSync(recordingResult.filePath)) {
            console.log('\n🖼️ Step 2: Generating thumbnail...');
            const thumbnailPath = await generateThumbnail(recordingResult.filePath);
            if (thumbnailPath) {
                console.log(`✅ Thumbnail generated: ${thumbnailPath}`);
            }
            else {
                console.log(`⚠️ Thumbnail generation failed`);
            }
        }
        else {
            console.log(`\n⚠️ Skipping thumbnail generation: Recording not successful or file not found`);
        }
        // Summary
        console.log(`
┌─────────────────────────────────────────────┐
│                 TEST SUMMARY                │
└─────────────────────────────────────────────┘
`);
        if (recordingResult.success) {
            console.log(`✅ Recording: SUCCESS`);
            console.log(`📂 File: ${recordingResult.filePath}`);
            console.log(`📊 Size: ${(recordingResult.fileSize / (1024 * 1024)).toFixed(2)} MB`);
            if (recordingResult.duration) {
                console.log(`⏱️ Duration: ${recordingResult.duration.toFixed(2)} seconds`);
            }
            if (recordingResult.resolution) {
                console.log(`📏 Resolution: ${recordingResult.resolution}`);
            }
            if (recordingResult.isPart) {
                console.log(`⚠️ Note: File was originally a partial file (.part)`);
            }
        }
        else {
            console.log(`❌ Recording: FAILED`);
            console.log(`⚠️ Possible issues:`);
            console.log(`  - Stream might be offline or inaccessible`);
            console.log(`  - URL might not be supported by yt-dlp`);
            console.log(`  - Path issues or permissions problems`);
            console.log(`  - Network connectivity issues`);
            console.log(`\n🧪 Troubleshooting:`);
            console.log(`  - Try manually with: yt-dlp "${url}" -o "./recordings/direct/test.mp4"`);
            console.log(`  - Check if yt-dlp needs updating: "pip install -U yt-dlp"`);
            console.log(`  - Try with a known working YouTube URL as a test`);
        }
    }
    catch (error) {
        console.error(`\n❌ Unexpected error in test:`, error);
        console.error(`Stack trace: ${error.stack}`);
    }
}
// Run the test
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
