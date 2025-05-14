"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDirectoryExists = ensureDirectoryExists;
exports.getRecordingPath = getRecordingPath;
exports.getThumbnailPath = getThumbnailPath;
exports.sanitizePath = sanitizePath;
exports.generateRecordingFilename = generateRecordingFilename;
exports.getPublicThumbnailUrl = getPublicThumbnailUrl;
exports.getPublicVideoUrl = getPublicVideoUrl;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const app_1 = __importDefault(require("../../config/app"));
const helpers_1 = require("./helpers");
/**
 * Ensures a directory exists, creating it if necessary
 */
function ensureDirectoryExists(dirPath) {
    if (!fs_1.default.existsSync(dirPath)) {
        fs_1.default.mkdirSync(dirPath, { recursive: true });
    }
}
/**
 * Generates a structured path for a recording based on platform, performer and date
 */
function getRecordingPath(platform, performer, date = new Date(), filename) {
    const { recordingsDir } = app_1.default.storage;
    const { organizeByPlatform, organizeByPerformer, organizeByDate } = app_1.default.recording;
    // Start with base recordings directory
    let basePath = recordingsDir;
    // Add platform subdirectory if configured
    if (organizeByPlatform) {
        basePath = path_1.default.join(basePath, sanitizePath(platform));
    }
    // Add performer subdirectory if configured
    if (organizeByPerformer) {
        basePath = path_1.default.join(basePath, sanitizePath(performer));
    }
    // Add date subdirectory if configured
    if (organizeByDate) {
        basePath = path_1.default.join(basePath, (0, helpers_1.formatDate)(date, 'YYYY-MM-DD'));
    }
    // Ensure the directory exists
    ensureDirectoryExists(basePath);
    // If a filename was provided, join it with the base path
    if (filename) {
        return path_1.default.join(basePath, filename);
    }
    // Otherwise, just return the directory path
    return basePath;
}
/**
 * Generates a structured path for thumbnails based on the recording path
 */
function getThumbnailPath(recordingPath, index = 0) {
    const { thumbnailsDir } = app_1.default.storage;
    // Extract the filename without extension
    const parsedPath = path_1.default.parse(recordingPath);
    const filename = `${parsedPath.name}-thumb-${index}.jpg`;
    // Ensure the directory exists
    ensureDirectoryExists(thumbnailsDir);
    return path_1.default.join(thumbnailsDir, filename);
}
/**
 * Sanitizes a string for use in a file path
 */
function sanitizePath(input) {
    // Replace spaces with underscores and remove invalid characters
    return input
        .replace(/\s+/g, '_')
        .replace(/[\\/:*?"<>|]/g, '')
        .toLowerCase();
}
/**
 * Generates a unique filename for a recording
 */
function generateRecordingFilename(performer, platform, date = new Date(), extension = 'mp4') {
    const formattedDate = (0, helpers_1.formatDate)(date, 'YYYY-MM-DD_HH-mm-ss');
    const sanitizedPerformer = sanitizePath(performer);
    const sanitizedPlatform = sanitizePath(platform);
    return `${sanitizedPerformer}_${sanitizedPlatform}_${formattedDate}.${extension}`;
}
/**
 * Creates relative URLs for accessing thumbnails via the web
 */
function getPublicThumbnailUrl(thumbnailPath) {
    const { publicDir, thumbnailsDir } = app_1.default.storage;
    const relativePath = path_1.default.relative(publicDir, thumbnailPath);
    return `/${relativePath.replace(/\\/g, '/')}`;
}
/**
 * Creates a relative URL for accessing the video via the web
 */
function getPublicVideoUrl(videoPath) {
    const { publicDir, recordingsDir } = app_1.default.storage;
    // If the video is in the public directory
    if (videoPath.startsWith(publicDir)) {
        const relativePath = path_1.default.relative(publicDir, videoPath);
        return `/${relativePath.replace(/\\/g, '/')}`;
    }
    // Otherwise, return a fake URL (this would be replaced with actual hosting URL)
    return `file://${videoPath}`;
}
