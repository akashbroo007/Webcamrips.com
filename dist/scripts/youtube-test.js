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
// Configure output directories
const RECORDINGS_DIR = path_1.default.join(process.cwd(), 'recordings', 'test');
const THUMBNAILS_DIR = path_1.default.join(process.cwd(), 'public', 'thumbnails');
// Create directories if they don't exist
[RECORDINGS_DIR, THUMBNAILS_DIR].forEach(dir => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
});
/**
 * Record the stream using yt-dlp
 */
async function recordStream(streamUrl, channelName, duration = 15) {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const outputFilename = `${channelName}-${timestamp}.mp4`;
    const outputPath = path_1.default.join(RECORDINGS_DIR, outputFilename);
    console.log(`Starting recording of ${streamUrl} for ${duration} seconds...`);
    console.log(`Output file: ${outputPath}`);
    return new Promise((resolve, reject) => {
        // Use yt-dlp to record the stream
        const args = [
            streamUrl,
            '--format', 'best',
            '-o', outputPath,
            '--no-part',
            '--no-playlist'
        ];
        console.log(`Running command: yt-dlp ${args.join(' ')}`);
        const ytdlpProcess = (0, child_process_1.spawn)('yt-dlp', args);
        // Set up logging for the process
        ytdlpProcess.stdout.on('data', (data) => {
            console.log(`[yt-dlp] ${data.toString()}`);
        });
        ytdlpProcess.stderr.on('data', (data) => {
            console.log(`[yt-dlp stderr] ${data.toString()}`);
        });
        // Set timeout to kill the process after duration seconds
        const timeout = setTimeout(() => {
            console.log(`Recording for ${duration} seconds completed, stopping...`);
            ytdlpProcess.kill('SIGTERM');
        }, duration * 1000);
        ytdlpProcess.on('close', (code) => {
            clearTimeout(timeout);
            if (code === 0 || code === null) {
                console.log('Recording completed successfully');
                // Check if file exists
                if (fs_1.default.existsSync(outputPath)) {
                    const stats = fs_1.default.statSync(outputPath);
                    console.log(`File size: ${stats.size} bytes`);
                    resolve(outputPath);
                }
                else if (fs_1.default.existsSync(`${outputPath}.part`)) {
                    const partPath = `${outputPath}.part`;
                    const stats = fs_1.default.statSync(partPath);
                    console.log(`Recording in progress (partial file). Size: ${stats.size} bytes`);
                    resolve(partPath);
                }
                else {
                    reject(new Error('Output file not found after recording'));
                }
            }
            else {
                console.error(`Recording process exited with code ${code}`);
                reject(new Error(`Recording process exited with code ${code}`));
            }
        });
    });
}
/**
 * Generate thumbnail for the recorded video
 */
async function generateThumbnail(videoPath) {
    const thumbnailPath = path_1.default.join(THUMBNAILS_DIR, `${path_1.default.basename(videoPath, path_1.default.extname(videoPath))}.jpg`);
    return new Promise((resolve, reject) => {
        console.log(`Generating thumbnail for ${videoPath}...`);
        // Use ffmpeg to generate thumbnail at 5 seconds
        const args = [
            '-i', videoPath,
            '-ss', '5',
            '-vframes', '1',
            '-vf', 'scale=640:-1',
            '-q:v', '2',
            thumbnailPath
        ];
        console.log(`Running command: ffmpeg ${args.join(' ')}`);
        const ffmpegProcess = (0, child_process_1.spawn)('ffmpeg', args);
        ffmpegProcess.stdout.on('data', (data) => {
            console.log(`[ffmpeg] ${data.toString()}`);
        });
        ffmpegProcess.stderr.on('data', (data) => {
            console.log(`[ffmpeg stderr] ${data.toString()}`);
        });
        ffmpegProcess.on('close', (code) => {
            if (code === 0) {
                console.log(`Thumbnail generated successfully at ${thumbnailPath}`);
                if (fs_1.default.existsSync(thumbnailPath)) {
                    const stats = fs_1.default.statSync(thumbnailPath);
                    console.log(`Thumbnail size: ${stats.size} bytes`);
                }
                resolve(thumbnailPath);
            }
            else {
                console.error(`ffmpeg process exited with code ${code}`);
                reject(new Error(`ffmpeg process exited with code ${code}`));
            }
        });
    });
}
/**
 * Main function to run the test
 */
async function main() {
    try {
        // YouTube live streams that are reliable for testing
        const YOUTUBE_TEST_STREAMS = [
            { url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', name: 'lofi-girl' }, // Lofi Girl
            { url: 'https://www.youtube.com/watch?v=zYvAxLX6OzE', name: 'live-cams-japan' }, // Japan walking cam
            { url: 'https://www.youtube.com/watch?v=HpKOSyUwU50', name: 'earth-cams' } // EarthCam
        ];
        // Get stream URL from command line or use default
        const args = process.argv.slice(2);
        const streamUrl = args[0] || YOUTUBE_TEST_STREAMS[0].url;
        const duration = args[1] ? parseInt(args[1], 10) : 15;
        // Find the name based on URL or use a default
        let channelName = 'youtube-test';
        const testStream = YOUTUBE_TEST_STREAMS.find(s => s.url === streamUrl);
        if (testStream) {
            channelName = testStream.name;
        }
        else if (streamUrl.includes('youtube.com/watch?v=')) {
            // Extract video ID from URL
            const videoId = new URL(streamUrl).searchParams.get('v');
            if (videoId) {
                channelName = `youtube-${videoId}`;
            }
        }
        console.log('=== YouTube Live Stream Recording Test ===');
        console.log(`URL: ${streamUrl}`);
        console.log(`Channel: ${channelName}`);
        console.log(`Duration: ${duration} seconds`);
        console.log('=======================================');
        // Step 1: Record the stream
        console.log('\n📹 Step 1: Recording stream...');
        const recordingPath = await recordStream(streamUrl, channelName, duration);
        // Step 2: Generate thumbnail
        console.log('\n🖼️ Step 2: Generating thumbnail...');
        const thumbnailPath = await generateThumbnail(recordingPath);
        console.log('\n✅ Test completed successfully');
        console.log('=======================================');
        console.log(`Recording: ${recordingPath}`);
        console.log(`Thumbnail: ${thumbnailPath}`);
        console.log('=======================================');
    }
    catch (error) {
        console.error('\n❌ Error in test:', error);
    }
}
// Run the test
main();
