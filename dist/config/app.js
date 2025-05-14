"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config({ path: '.env.local' });
// Default values for essential configuration
const DEFAULT_MONGODB_URI = 'mongodb://localhost:27017/webcamrips';
const DEFAULT_RECORDINGS_DIR = path_1.default.join(process.cwd(), 'recordings');
const DEFAULT_PUBLIC_DIR = path_1.default.join(process.cwd(), 'public');
const DEFAULT_THUMBNAILS_DIR = path_1.default.join(DEFAULT_PUBLIC_DIR, 'thumbnails');
const DEFAULT_CHECK_INTERVAL = '*/5 * * * *'; // Every 5 minutes
const DEFAULT_UPLOAD_INTERVAL = '0 */1 * * *'; // Every hour
const DEFAULT_MAX_RECORDING_DURATION = 120; // 2 hours in minutes
const DEFAULT_THUMBNAIL_COUNT = 3;
/**
 * Application configuration
 */
const appConfig = {
    // Database
    mongodb: {
        uri: process.env.MONGODB_URI || DEFAULT_MONGODB_URI,
        options: {} // Remove deprecated options
    },
    // File storage
    storage: {
        recordingsDir: process.env.RECORDINGS_DIR || DEFAULT_RECORDINGS_DIR,
        publicDir: process.env.PUBLIC_DIR || DEFAULT_PUBLIC_DIR,
        thumbnailsDir: process.env.THUMBNAILS_DIR || DEFAULT_THUMBNAILS_DIR,
        createDirectories: true, // Auto-create directories if they don't exist
    },
    // Recording settings
    recording: {
        maxDuration: parseInt(process.env.MAX_RECORDING_DURATION || DEFAULT_MAX_RECORDING_DURATION.toString(), 10),
        defaultQuality: process.env.DEFAULT_QUALITY || 'best',
        useYtdlp: true, // Use yt-dlp by default
        useStreamlink: process.env.USE_STREAMLINK === 'true', // Use streamlink as fallback
        thumbnailCount: parseInt(process.env.THUMBNAIL_COUNT || DEFAULT_THUMBNAIL_COUNT.toString(), 10),
        thumbnailTimemarks: ['10%', '50%', '90%'], // Default thumbnail positions
        organizeByPlatform: true, // Create platform-specific subdirectories
        organizeByPerformer: true, // Create performer-specific subdirectories
        organizeByDate: true, // Create date-specific subdirectories (YYYY-MM-DD)
    },
    // Scheduler settings
    scheduler: {
        checkInterval: process.env.CHECK_INTERVAL || DEFAULT_CHECK_INTERVAL,
        uploadInterval: process.env.UPLOAD_INTERVAL || DEFAULT_UPLOAD_INTERVAL,
        enableAutoStart: process.env.ENABLE_AUTO_START === 'true',
        maxConcurrentRecordings: parseInt(process.env.MAX_CONCURRENT_RECORDINGS || '5', 10),
    },
    // Path to cookies file (for authenticated stream access)
    cookies: {
        chrome: process.env.CHROME_COOKIES_PATH || '',
        firefox: process.env.FIREFOX_COOKIES_PATH || '',
    },
    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        console: process.env.LOG_CONSOLE !== 'false',
        file: process.env.LOG_FILE !== 'false',
        directory: process.env.LOG_DIR || path_1.default.join(process.cwd(), 'logs'),
    }
};
exports.default = appConfig;
