"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env.local
dotenv_1.default.config({ path: '.env.local' });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
// Configure output directories
const RECORDINGS_DIR = path_1.default.join(process.cwd(), 'recordings');
const THUMBNAILS_DIR = path_1.default.join(process.cwd(), 'public', 'thumbnails');
// Create directories if they don't exist
[THUMBNAILS_DIR].forEach(dir => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
});
async function generateThumbnail(videoPath) {
    const thumbnailPath = path_1.default.join(THUMBNAILS_DIR, `${path_1.default.basename(videoPath, path_1.default.extname(videoPath))}.jpg`);
    return new Promise((resolve, reject) => {
        console.log(`Generating thumbnail for ${videoPath} at ${thumbnailPath}...`);
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
                resolve(thumbnailPath);
            }
            else {
                console.error(`ffmpeg process exited with code ${code}`);
                reject(new Error(`ffmpeg process exited with code ${code}`));
            }
        });
    });
}
async function testThumbnailGeneration() {
    try {
        // Find the recorded files
        const files = fs_1.default.readdirSync(RECORDINGS_DIR);
        const recordingFiles = files.filter(file => file.includes('test-recording') && file.endsWith('.mp4.part'));
        if (recordingFiles.length === 0) {
            console.error('No recording files found to generate thumbnails from');
            return;
        }
        // Get the newest recording file (with largest size)
        const newestRecording = recordingFiles
            .map(file => ({
            name: file,
            size: fs_1.default.statSync(path_1.default.join(RECORDINGS_DIR, file)).size
        }))
            .sort((a, b) => b.size - a.size)[0];
        console.log(`Selected recording file: ${newestRecording.name}`);
        // Generate a thumbnail
        const videoPath = path_1.default.join(RECORDINGS_DIR, newestRecording.name);
        const thumbnailPath = await generateThumbnail(videoPath);
        console.log('Thumbnail generation test completed successfully!');
        console.log(`Video: ${videoPath}`);
        console.log(`Thumbnail: ${thumbnailPath}`);
        // Display thumbnail size
        if (fs_1.default.existsSync(thumbnailPath)) {
            const stats = fs_1.default.statSync(thumbnailPath);
            console.log(`Thumbnail size: ${stats.size} bytes`);
        }
    }
    catch (error) {
        console.error('Error generating thumbnail:', error);
    }
}
// Run the test
testThumbnailGeneration();
