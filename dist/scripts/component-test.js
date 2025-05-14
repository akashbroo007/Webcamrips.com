"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const db_1 = require("../lib/utils/db");
const ffmpeg_1 = require("../lib/utils/ffmpeg");
const streamDetector_1 = __importDefault(require("../lib/services/streamDetector"));
const platforms_1 = __importDefault(require("../config/platforms"));
const Performer_1 = __importDefault(require("../lib/models/Performer"));
const Recording_1 = __importDefault(require("../lib/models/Recording"));
const Video_1 = __importDefault(require("../lib/models/Video"));
const paths_1 = require("../lib/utils/paths");
// Get command line arguments
const args = process.argv.slice(2);
const command = args[0]?.toLowerCase();
const param1 = args[1];
const param2 = args[2];
/**
 * Main function to run the component test
 */
async function main() {
    console.log('\n🧪 WebcamRips Component Tester');
    if (!command) {
        showHelp();
        return;
    }
    try {
        switch (command) {
            case 'detect':
                await testDetection(param1, param2);
                break;
            case 'record':
                await testRecording(param1, param2);
                break;
            case 'thumbnail':
                await testThumbnail(param1);
                break;
            case 'metadata':
                await testMetadata(param1);
                break;
            case 'platform':
                await testPlatform(param1);
                break;
            case 'db':
                await testDatabase();
                break;
            case 'help':
            default:
                showHelp();
                break;
        }
    }
    catch (error) {
        console.error(`❌ Test failed: ${error.message}`);
    }
}
/**
 * Shows the help message with all available commands
 */
function showHelp() {
    console.log('\nUsage: npx ts-node scripts/component-test.ts [command] [parameters]');
    console.log('\nAvailable commands:');
    console.log('  detect [url] [platform]     - Test stream detection for a URL');
    console.log('  record [url] [duration]     - Test recording a URL for specified duration (seconds)');
    console.log('  thumbnail [videoPath]       - Generate thumbnails for a video file');
    console.log('  metadata [videoPath]        - Extract metadata from a video file');
    console.log('  platform [platformName]     - Test DOM selectors for a specific platform');
    console.log('  db                         - Test database connectivity and models');
    console.log('  help                       - Show this help message');
    console.log('\nExamples:');
    console.log('  npx ts-node scripts/component-test.ts detect https://chaturbate.com/username/ Chaturbate');
    console.log('  npx ts-node scripts/component-test.ts record https://www.youtube.com/watch?v=jfKfPfyJRdk 15');
    console.log('  npx ts-node scripts/component-test.ts thumbnail ./recordings/test-video.mp4');
    console.log('  npx ts-node scripts/component-test.ts platform Stripchat');
}
/**
 * Test stream detection for a URL
 */
async function testDetection(url, platformName) {
    if (!url) {
        console.error('❌ Error: URL is required for detection test');
        console.log('Example: npx ts-node scripts/component-test.ts detect https://chaturbate.com/username/ Chaturbate');
        return;
    }
    console.log(`\n🔍 Testing Stream Detection for URL: ${url}`);
    // If platform name is provided, use it to get the platform config
    if (platformName && platforms_1.default[platformName]) {
        const platform = platforms_1.default[platformName];
        console.log(`Using platform configuration: ${platformName}`);
        console.log(`DOM selectors: ${JSON.stringify(platform.isOnlineSelectors)}`);
        // Create a test performer with this platform
        const testPerformer = {
            name: 'TestPerformer',
            platforms: [{
                    platform: platformName,
                    channelId: url.split('/').filter(Boolean).pop() || 'unknown',
                    url: url
                }],
            isActive: true
        };
        console.log('\nTesting with streamDetector service...');
        try {
            const results = await streamDetector_1.default.checkPerformerStatus(testPerformer);
            const status = results.get(platformName);
            if (status?.isOnline) {
                console.log('✅ Stream detected as ONLINE');
                console.log(`   Stream URL: ${status.streamUrl}`);
                console.log(`   Detected at: ${status.detectedAt}`);
            }
            else {
                console.log('⚠️ Stream detected as OFFLINE');
            }
        }
        catch (error) {
            console.error(`❌ Detection error: ${error.message}`);
        }
    }
    else {
        // Simple URL check without platform-specific logic
        console.log('No platform specified, performing basic URL check...');
        try {
            // Simple HTTP check to see if URL is accessible
            const { default: fetch } = await Promise.resolve().then(() => __importStar(require('node-fetch')));
            const response = await fetch(url);
            console.log(`URL status: ${response.status} ${response.statusText}`);
            console.log(`Content type: ${response.headers.get('content-type')}`);
            if (response.ok) {
                console.log('✅ URL is accessible');
            }
            else {
                console.log('⚠️ URL returned non-200 status code');
            }
        }
        catch (error) {
            console.error(`❌ URL check failed: ${error.message}`);
        }
    }
}
/**
 * Test recording a stream
 */
async function testRecording(url, durationStr) {
    if (!url) {
        console.error('❌ Error: URL is required for recording test');
        console.log('Example: npx ts-node scripts/component-test.ts record https://www.youtube.com/watch?v=jfKfPfyJRdk 15');
        return;
    }
    const duration = durationStr ? parseInt(durationStr, 10) : 10;
    console.log(`\n🎥 Testing Recording for URL: ${url} (${duration} seconds)`);
    // Ensure output directory exists
    const outputDir = path_1.default.join(process.cwd(), 'recordings', 'test');
    (0, paths_1.ensureDirectoryExists)(outputDir);
    // Create output filename
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const outputPath = path_1.default.join(outputDir, `component-test-${timestamp}.mp4`);
    console.log(`Recording to: ${outputPath}`);
    console.log(`Duration: ${duration} seconds`);
    return new Promise((resolve, reject) => {
        const args = [
            url,
            '-o', outputPath,
            '--no-part',
            '--no-playlist',
            '--format', 'best',
        ];
        console.log(`Running: yt-dlp ${args.join(' ')}`);
        const process = (0, child_process_1.spawn)('yt-dlp', args);
        // Log output
        process.stdout.on('data', (data) => {
            console.log(`[yt-dlp] ${data.toString().trim()}`);
        });
        process.stderr.on('data', (data) => {
            console.log(`[yt-dlp stderr] ${data.toString().trim()}`);
        });
        // Set timeout to kill the process after duration
        const timeout = setTimeout(() => {
            console.log(`Recording for ${duration} seconds completed, stopping...`);
            process.kill('SIGTERM');
        }, duration * 1000);
        process.on('close', (code) => {
            clearTimeout(timeout);
            if (code === 0 || (code === null && fs_1.default.existsSync(outputPath))) {
                console.log('✅ Recording completed successfully');
                if (fs_1.default.existsSync(outputPath)) {
                    const stats = fs_1.default.statSync(outputPath);
                    console.log(`File saved: ${outputPath}`);
                    console.log(`File size: ${formatBytes(stats.size)}`);
                    resolve();
                }
                else {
                    console.error('❌ Output file not found after recording');
                    reject(new Error('Output file not found'));
                }
            }
            else {
                console.error(`❌ Recording process exited with code ${code}`);
                reject(new Error(`Recording process exited with code ${code}`));
            }
        });
        process.on('error', (error) => {
            clearTimeout(timeout);
            console.error(`❌ Recording process error: ${error.message}`);
            reject(error);
        });
    });
}
/**
 * Test thumbnail generation for a video
 */
async function testThumbnail(videoPath) {
    if (!videoPath) {
        console.error('❌ Error: Video path is required for thumbnail test');
        console.log('Example: npx ts-node scripts/component-test.ts thumbnail ./recordings/test-video.mp4');
        return;
    }
    if (!fs_1.default.existsSync(videoPath)) {
        console.error(`❌ Error: Video file not found: ${videoPath}`);
        return;
    }
    console.log(`\n🖼️ Testing Thumbnail Generation for: ${videoPath}`);
    try {
        // Test with different thumbnail counts
        for (const count of [1, 3]) {
            console.log(`\nGenerating ${count} thumbnail(s)...`);
            const thumbnailPaths = await (0, ffmpeg_1.generateThumbnails)({
                inputPath: videoPath,
                count: count
            });
            console.log(`✅ Generated ${thumbnailPaths.length} thumbnail(s):`);
            thumbnailPaths.forEach((path, index) => {
                if (fs_1.default.existsSync(path)) {
                    const stats = fs_1.default.statSync(path);
                    console.log(`   ${index + 1}. ${path} (${formatBytes(stats.size)})`);
                }
                else {
                    console.log(`   ${index + 1}. ${path} (FILE NOT FOUND)`);
                }
            });
        }
    }
    catch (error) {
        console.error(`❌ Thumbnail generation failed: ${error.message}`);
    }
}
/**
 * Test metadata extraction for a video
 */
async function testMetadata(videoPath) {
    if (!videoPath) {
        console.error('❌ Error: Video path is required for metadata test');
        console.log('Example: npx ts-node scripts/component-test.ts metadata ./recordings/test-video.mp4');
        return;
    }
    if (!fs_1.default.existsSync(videoPath)) {
        console.error(`❌ Error: Video file not found: ${videoPath}`);
        return;
    }
    console.log(`\n📊 Testing Metadata Extraction for: ${videoPath}`);
    try {
        const metadata = await (0, ffmpeg_1.getVideoMetadata)(videoPath);
        console.log('✅ Metadata extracted:');
        console.log(JSON.stringify(metadata, null, 2));
        if (metadata.duration) {
            console.log(`Duration: ${formatTime(metadata.duration)}`);
        }
        if (metadata.width && metadata.height) {
            console.log(`Resolution: ${metadata.width}x${metadata.height}`);
        }
    }
    catch (error) {
        console.error(`❌ Metadata extraction failed: ${error.message}`);
    }
}
/**
 * Test platform-specific configurations
 */
async function testPlatform(platformName) {
    if (!platformName) {
        console.log('Available platforms:');
        Object.keys(platforms_1.default).forEach(name => {
            console.log(`- ${name}`);
        });
        console.log('\nExample: npx ts-node scripts/component-test.ts platform Chaturbate');
        return;
    }
    const platform = platforms_1.default[platformName];
    if (!platform) {
        console.error(`❌ Error: Platform "${platformName}" not found in configuration`);
        console.log('Available platforms:');
        Object.keys(platforms_1.default).forEach(name => {
            console.log(`- ${name}`);
        });
        return;
    }
    console.log(`\n🔍 Testing Platform Configuration: ${platformName}`);
    console.log(JSON.stringify(platform, null, 2));
    console.log('\nDOM Selectors:');
    console.log(`- Positive: ${platform.isOnlineSelectors.positive.join(', ')}`);
    if (platform.isOnlineSelectors.negative) {
        console.log(`- Negative: ${platform.isOnlineSelectors.negative.join(', ')}`);
    }
    console.log('\nStream URL Pattern:');
    console.log(platform.streamUrlPattern);
    // Example URL with placeholder
    const exampleUrl = platform.streamUrlPattern.replace('{identifier}', 'example_user');
    console.log('\nExample URL:');
    console.log(exampleUrl);
}
/**
 * Test database connectivity and models
 */
async function testDatabase() {
    console.log('\n🧱 Testing Database Connectivity and Models');
    try {
        console.log('Connecting to MongoDB...');
        await (0, db_1.connectDB)();
        console.log('✅ Connected to MongoDB');
        // Test Performer model
        console.log('\nTesting Performer model...');
        const performerCount = await Performer_1.default.countDocuments();
        console.log(`Total performers: ${performerCount}`);
        // Test Recording model
        console.log('\nTesting Recording model...');
        const recordingCount = await Recording_1.default.countDocuments();
        console.log(`Total recordings: ${recordingCount}`);
        // Test Video model
        console.log('\nTesting Video model...');
        const videoCount = await Video_1.default.countDocuments();
        console.log(`Total videos: ${videoCount}`);
        // Test newest recordings
        console.log('\nMost recent recordings:');
        const recentRecordings = await Recording_1.default.find()
            .sort({ createdAt: -1 })
            .limit(5);
        if (recentRecordings.length === 0) {
            console.log('No recordings found');
        }
        else {
            recentRecordings.forEach((rec, i) => {
                console.log(`${i + 1}. ID: ${rec._id}`);
                console.log(`   Status: ${rec.status}`);
                console.log(`   Platform: ${rec.platform}`);
                console.log(`   Started: ${rec.startTime}`);
                console.log(`   Duration: ${rec.duration || 'N/A'}`);
                console.log('---');
            });
        }
        console.log('✅ Database test completed');
    }
    catch (error) {
        console.error(`❌ Database test failed: ${error.message}`);
    }
}
/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
/**
 * Format seconds to MM:SS format
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
// Run the main function
main();
