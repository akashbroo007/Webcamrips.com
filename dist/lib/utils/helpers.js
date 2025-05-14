"use strict";
/**
 * Helper functions for date formatting and general utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = formatDate;
exports.formatDuration = formatDuration;
exports.formatFileSize = formatFileSize;
exports.generateId = generateId;
exports.isValidUrl = isValidUrl;
exports.delay = delay;
exports.tryCatch = tryCatch;
exports.retry = retry;
/**
 * Format a date according to the specified format
 * @param date The date to format
 * @param format The format string (YYYY-MM-DD, etc.)
 * @returns Formatted date string
 */
function formatDate(date, format) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    // Replace format tokens with actual values
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}
/**
 * Generate a human-readable duration string from seconds
 * @param seconds Duration in seconds
 * @returns Formatted duration string (HH:MM:SS)
 */
function formatDuration(seconds) {
    if (!seconds || isNaN(seconds))
        return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}
/**
 * Format file size into human-readable format
 * @param bytes Size in bytes
 * @param decimals Number of decimal places to show
 * @returns Formatted size string (e.g., "4.2 MB")
 */
function formatFileSize(bytes, decimals = 2) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}
/**
 * Generate a random ID
 * @param prefix Optional prefix for the ID
 * @returns Random ID string
 */
function generateId(prefix = '') {
    const randomPart = Math.random().toString(36).substring(2, 10);
    const timestamp = Date.now().toString(36);
    return `${prefix}${timestamp}${randomPart}`;
}
/**
 * Check if a string is a valid URL
 * @param str String to check
 * @returns Whether the string is a valid URL
 */
function isValidUrl(str) {
    try {
        new URL(str);
        return true;
    }
    catch (e) {
        return false;
    }
}
/**
 * Delay execution for specified milliseconds
 * @param ms Milliseconds to delay
 * @returns Promise that resolves after the delay
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Safely execute a function and return its result,
 * or a default value if it throws an error
 * @param fn Function to execute
 * @param defaultValue Default value to return if function throws
 * @returns Result of function or default value
 */
function tryCatch(fn, defaultValue) {
    try {
        return fn();
    }
    catch (error) {
        return defaultValue;
    }
}
/**
 * Retry a function multiple times until it succeeds
 * @param fn Function to retry
 * @param maxRetries Maximum number of retries
 * @param delayMs Delay between retries in milliseconds
 * @returns Promise resolving to the function result
 */
async function retry(fn, maxRetries = 3, delayMs = 1000) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                await delay(delayMs);
            }
        }
    }
    throw lastError;
}
