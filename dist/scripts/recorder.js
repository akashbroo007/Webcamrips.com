#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RecorderEngine_1 = require("../lib/services/RecorderEngine");
const StreamDetectorService_1 = require("../lib/services/StreamDetectorService");
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const commander_1 = require("commander");
// Load environment variables
dotenv_1.default.config();
// Initialize MongoDB connection
mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/webcamrips')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
// Initialize services
const streamDetector = new StreamDetectorService_1.StreamDetectorService();
const recorder = new RecorderEngine_1.RecorderEngine(streamDetector);
// CLI program setup
const program = new commander_1.Command();
program
    .name('recorder')
    .description('WebcamRips stream recorder CLI')
    .version('1.0.0');
program
    .command('record')
    .description('Record a stream from a URL')
    .argument('<url>', 'URL of the stream to record')
    .action(async (url) => {
    try {
        await recorder.initialize();
        console.log('Starting recording...');
        const video = await recorder.detectAndRecord(url);
        if (video) {
            console.log('Recording completed successfully!');
            console.log('Video saved:', video.fileUrl);
        }
        else {
            console.log('No stream detected or recording failed');
        }
    }
    catch (error) {
        console.error('Error during recording:', error);
    }
    finally {
        await recorder.cleanup();
        await mongoose_1.default.disconnect();
    }
});
program
    .command('monitor')
    .description('Monitor multiple URLs for streams')
    .argument('<urls...>', 'URLs to monitor')
    .option('-i, --interval <seconds>', 'Check interval in seconds', '60')
    .action(async (urls, options) => {
    try {
        await recorder.initialize();
        console.log('Starting stream monitoring...');
        const interval = parseInt(options.interval) * 1000;
        while (true) {
            for (const url of urls) {
                console.log(`Checking ${url}...`);
                const video = await recorder.detectAndRecord(url);
                if (video) {
                    console.log('New recording started:', video.fileUrl);
                }
            }
            console.log(`Waiting ${options.interval} seconds before next check...`);
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    }
    catch (error) {
        console.error('Error during monitoring:', error);
    }
    finally {
        await recorder.cleanup();
        await mongoose_1.default.disconnect();
    }
});
program.parse();
