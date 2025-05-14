"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cn = cn;
exports.formatDuration = formatDuration;
exports.formatDate = formatDate;
exports.formatFileSize = formatFileSize;
exports.formatViews = formatViews;
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
/**
 * Client-side safe utilities
 */
/**
 * Combines class names with Tailwind's class merging
 */
function cn(...inputs) {
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
/**
 * Format a number of seconds into MM:SS format
 */
function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
/**
 * Format a date string
 */
function formatDate(date, format = 'DD/MM/YYYY') {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    let result = format;
    result = result.replace('DD', day);
    result = result.replace('MM', month);
    result = result.replace('YYYY', year.toString());
    return result;
}
/**
 * Format a file size in bytes to a human-readable string
 */
function formatFileSize(bytes) {
    if (bytes === 0)
        return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
}
/**
 * Format a number of views (e.g., 1000 -> 1K)
 */
function formatViews(views) {
    if (views >= 1000000) {
        return (views / 1000000).toFixed(1) + 'M';
    }
    else if (views >= 1000) {
        return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
}
