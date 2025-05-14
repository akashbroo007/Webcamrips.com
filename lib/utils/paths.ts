import path from 'path';
import fs from 'fs';
import appConfig from '../../config/app';
import { formatDate } from './helpers';

/**
 * Ensures a directory exists, creating it if necessary
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Generates a structured path for a recording based on platform, performer and date
 */
export function getRecordingPath(
  platform: string,
  performer: string,
  date: Date = new Date(),
  filename?: string
): string {
  const { recordingsDir } = appConfig.storage;
  const { organizeByPlatform, organizeByPerformer, organizeByDate } = appConfig.recording;
  
  // Start with base recordings directory
  let basePath = recordingsDir;
  
  // Add platform subdirectory if configured
  if (organizeByPlatform) {
    basePath = path.join(basePath, sanitizePath(platform));
  }
  
  // Add performer subdirectory if configured
  if (organizeByPerformer) {
    basePath = path.join(basePath, sanitizePath(performer));
  }
  
  // Add date subdirectory if configured
  if (organizeByDate) {
    basePath = path.join(basePath, formatDate(date, 'YYYY-MM-DD'));
  }
  
  // Ensure the directory exists
  ensureDirectoryExists(basePath);
  
  // If a filename was provided, join it with the base path
  if (filename) {
    return path.join(basePath, filename);
  }
  
  // Otherwise, just return the directory path
  return basePath;
}

/**
 * Generates a structured path for thumbnails based on the recording path
 */
export function getThumbnailPath(
  recordingPath: string,
  index: number = 0
): string {
  const { thumbnailsDir } = appConfig.storage;
  
  // Extract the filename without extension
  const parsedPath = path.parse(recordingPath);
  const filename = `${parsedPath.name}-thumb-${index}.jpg`;
  
  // Ensure the directory exists
  ensureDirectoryExists(thumbnailsDir);
  
  return path.join(thumbnailsDir, filename);
}

/**
 * Sanitizes a string for use in a file path
 */
export function sanitizePath(input: string): string {
  // Replace spaces with underscores and remove invalid characters
  return input
    .replace(/\s+/g, '_')
    .replace(/[\\/:*?"<>|]/g, '')
    .toLowerCase();
}

/**
 * Generates a unique filename for a recording
 */
export function generateRecordingFilename(
  performer: string,
  platform: string,
  date: Date = new Date(),
  extension: string = 'mp4'
): string {
  const formattedDate = formatDate(date, 'YYYY-MM-DD_HH-mm-ss');
  const sanitizedPerformer = sanitizePath(performer);
  const sanitizedPlatform = sanitizePath(platform);
  
  return `${sanitizedPerformer}_${sanitizedPlatform}_${formattedDate}.${extension}`;
}

/**
 * Creates relative URLs for accessing thumbnails via the web
 */
export function getPublicThumbnailUrl(thumbnailPath: string): string {
  const { publicDir, thumbnailsDir } = appConfig.storage;
  const relativePath = path.relative(publicDir, thumbnailPath);
  
  return `/${relativePath.replace(/\\/g, '/')}`;
}

/**
 * Creates a relative URL for accessing the video via the web
 */
export function getPublicVideoUrl(videoPath: string): string {
  const { publicDir, recordingsDir } = appConfig.storage;
  
  // If the video is in the public directory
  if (videoPath.startsWith(publicDir)) {
    const relativePath = path.relative(publicDir, videoPath);
    return `/${relativePath.replace(/\\/g, '/')}`;
  }
  
  // Otherwise, return a fake URL (this would be replaced with actual hosting URL)
  return `file://${videoPath}`;
}