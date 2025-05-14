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
const RECORDINGS_DIR = path_1.default.join(process.cwd(), 'recordings', 'adult-test');
const THUMBNAILS_DIR = path_1.default.join(process.cwd(), 'public', 'thumbnails');
// Create directories if they don't exist
[RECORDINGS_DIR, THUMBNAILS_DIR].forEach(dir => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
});
// Mapping of alternative domains to platforms
const DOMAIN_MAPPING = {
    'cht.xxx': {
        platform: 'Chaturbate',
        ytdlpFlags: []
    },
    'stripchat.global': {
        platform: 'Stripchat',
        ytdlpFlags: []
    }
};
/**
 * Determine platform from URL
 */
function getPlatformFromUrl(url) {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    for (const [domain, config] of Object.entries(DOMAIN_MAPPING)) {
        if (hostname.includes(domain)) {
            return config;
        }
    }
    return null;
}
/**
 * Extract performer name from URL
 */
function getPerformerFromUrl(url) {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    return pathParts[0] || 'unknown';
}
/**
 * Record the stream using yt-dlp
 */
async function recordStream(streamUrl, performerName, platformInfo, duration = 15) {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const outputFilename = `${performerName}-${timestamp}.mp4`;
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
            '--no-playlist',
            ...(platformInfo.ytdlpFlags || [])
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
        // Get stream URL from command line
        const args = process.argv.slice(2);
        const url = args[0];
        const duration = args[1] ? parseInt(args[1], 10) : 15;
        if (!url) {
            console.log('No URL provided. Please provide a URL to test.');
            console.log('\nSupported alternative domains:');
            console.log('- cht.xxx (Chaturbate alternative)');
            console.log('- stripchat.global (Stripchat alternative)');
            console.log('\nUsage examples:');
            console.log('npx ts-node -P tsconfig.scripts.json scripts/test-alt-domains.ts "https://www.cht.xxx/performer_name/" 10');
            console.log('npx ts-node -P tsconfig.scripts.json scripts/test-alt-domains.ts "https://stripchat.global/performer_name" 15');
            return;
        }
        // Determine platform from URL
        const platformInfo = getPlatformFromUrl(url);
        if (!platformInfo) {
            console.log('❌ Unsupported domain. Only cht.xxx and stripchat.global are supported by this script.');
            return;
        }
        // Extract performer name from URL
        const performerName = getPerformerFromUrl(url);
        console.log(`=== Alternative Domain Recording Test ===`);
        console.log(`URL: ${url}`);
        console.log(`Performer: ${performerName}`);
        console.log(`Platform: ${platformInfo.platform}`);
        console.log(`Recording duration: ${duration} seconds`);
        console.log('=======================================');
        // Record the stream 
        // (No online detection - we assume the performer is online if the URL is provided)
        console.log('\n📹 Step 1: Recording stream...');
        const recordingPath = await recordStream(url, performerName, platformInfo, duration);
        // Generate thumbnail if recording was successful
        if (fs_1.default.existsSync(recordingPath)) {
            console.log('\n🖼️ Step 2: Generating thumbnail...');
            try {
                const thumbnailPath = await generateThumbnail(recordingPath);
                console.log(`✅ Thumbnail generated: ${thumbnailPath}`);
            }
            catch (err) {
                console.log(`⚠️ Thumbnail generation failed: ${err.message}`);
            }
        }
        console.log('\n✅ Test completed');
        console.log(`Recording saved: ${recordingPath}`);
    }
    catch (error) {
        console.error('❌ Error in test:', error);
    }
}
// Run the test
main();
