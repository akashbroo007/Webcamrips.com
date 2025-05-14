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
// Load environment variables
dotenv_1.default.config();
async function main() {
    try {
        // Initialize MongoDB connection
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/webcamrips');
        console.log('Connected to MongoDB');
        // Initialize services
        const streamDetector = new StreamDetectorService_1.StreamDetectorService();
        const recorder = new RecorderEngine_1.RecorderEngine(streamDetector);
        // Test stream detection
        console.log('\nTesting stream detection...');
        await streamDetector.initialize();
        const testUrl = 'https://example.com/stream'; // Replace with a real stream URL
        const streamUrl = await streamDetector.detectStream(testUrl);
        console.log('Detected stream URL:', streamUrl);
        await streamDetector.cleanup();
        // Test recording
        console.log('\nTesting recording...');
        await recorder.initialize();
        const video = await recorder.detectAndRecord(testUrl);
        if (video) {
            console.log('Recording completed successfully!');
            console.log('Video details:', {
                title: video.title,
                fileUrl: video.fileUrl,
                thumbnail: video.thumbnail,
                performerId: video.performerId
            });
        }
        else {
            console.log('No stream detected or recording failed');
        }
        await recorder.cleanup();
    }
    catch (error) {
        console.error('Error during testing:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('\nTest completed');
    }
}
main();
