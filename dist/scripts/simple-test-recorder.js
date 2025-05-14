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
const RECORDINGS_DIR = path_1.default.join(process.cwd(), 'recordings');
const THUMBNAILS_DIR = path_1.default.join(process.cwd(), 'public', 'thumbnails');
// Create directories if they don't exist
[RECORDINGS_DIR, THUMBNAILS_DIR].forEach(dir => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
});
async function testStreamRecording() {
    try {
        console.log('Starting test recording without database...');
        // Test URL - using a public livestream for testing
        const testStreamUrl = 'https://www.youtube.com/watch?v=jfKfPfyJRdk';
        const outputFilename = `test-recording-${Date.now()}.mp4`;
        const outputPath = path_1.default.join(RECORDINGS_DIR, outputFilename);
        console.log(`Starting test recording to ${outputPath}...`);
        // Use yt-dlp to record the stream
        const args = [
            testStreamUrl,
            '--format', 'best',
            '-o', outputPath,
            '--no-playlist',
            '--max-filesize', '100M' // Limit file size to 100MB for testing
        ];
        console.log(`Running command: yt-dlp ${args.join(' ')}`);
        const ytdlpProcess = (0, child_process_1.spawn)('yt-dlp', args);
        // Set up logging for the process
        ytdlpProcess.stdout.on('data', (data) => {
            console.log(`[test] stdout: ${data.toString()}`);
        });
        ytdlpProcess.stderr.on('data', (data) => {
            console.log(`[test] stderr: ${data.toString()}`);
        });
        // Wait for process to finish or timeout after 15 seconds
        const result = await new Promise((resolve) => {
            console.log('Recording...');
            // Set timeout to kill the process after 15 seconds
            const timeout = setTimeout(() => {
                console.log('Timeout reached, stopping recording...');
                ytdlpProcess.kill('SIGTERM');
                resolve(false);
            }, 15 * 1000);
            ytdlpProcess.on('close', (code) => {
                clearTimeout(timeout);
                console.log(`yt-dlp process exited with code ${code}`);
                resolve(code === 0);
            });
        });
        // Check if file was created
        if (fs_1.default.existsSync(outputPath)) {
            const stats = fs_1.default.statSync(outputPath);
            console.log(`Recording successful! File size: ${stats.size} bytes`);
            return true;
        }
        else if (fs_1.default.existsSync(`${outputPath}.part`)) {
            const stats = fs_1.default.statSync(`${outputPath}.part`);
            console.log(`Recording in progress! Partial file created with size: ${stats.size} bytes`);
            return true;
        }
        else {
            console.error('Recording failed! Output file not found.');
            return false;
        }
        console.log('Test completed.');
    }
    catch (error) {
        console.error('Error in test:', error);
        return false;
    }
    finally {
        // Exit the process
        process.exit(0);
    }
}
// Run the test
testStreamRecording();
