import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Default values for essential configuration
const DEFAULT_MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/webcamrips';
const DEFAULT_RECORDINGS_DIR = path.join(process.cwd(), 'recordings');
const DEFAULT_PUBLIC_DIR = path.join(process.cwd(), 'public');
const DEFAULT_THUMBNAILS_DIR = path.join(DEFAULT_PUBLIC_DIR, 'thumbnails');
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
    uri: DEFAULT_MONGODB_URI,
    options: {
      serverSelectionTimeoutMS: 30000, // Timeout after 30 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      w: 'majority' as const
    }
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
    maxDuration: process.env.MAX_RECORDING_DURATION ? parseInt(process.env.MAX_RECORDING_DURATION) : DEFAULT_MAX_RECORDING_DURATION,
    defaultQuality: process.env.DEFAULT_QUALITY || 'best',
    useYtdlp: true, // Use yt-dlp by default
    useStreamlink: process.env.USE_STREAMLINK === 'true', // Use streamlink as fallback
    thumbnailCount: process.env.THUMBNAIL_COUNT ? parseInt(process.env.THUMBNAIL_COUNT) : DEFAULT_THUMBNAIL_COUNT,
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
    maxConcurrentRecordings: process.env.MAX_CONCURRENT_RECORDINGS ? parseInt(process.env.MAX_CONCURRENT_RECORDINGS) : 5,
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
    directory: path.join(process.cwd(), 'logs'),
  }
};

export default appConfig; 