"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Configuration for supported cam platforms
 */
const platforms = {
    'Chaturbate': {
        name: 'Chaturbate',
        baseUrl: 'https://chaturbate.com',
        identifierType: 'username',
        streamUrlPattern: 'https://chaturbate.com/{identifier}/',
        isOnlineSelectors: {
            positive: ['#still_video_object', 'video'],
            negative: ['.offline_tipping']
        },
        ytdlpFlags: ['--cookies-from-browser=chrome'],
        streamlinkFlags: ['--http-header', 'User-Agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'],
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        cookies: true
    },
    'Stripchat': {
        name: 'Stripchat',
        baseUrl: 'https://stripchat.com',
        identifierType: 'username',
        streamUrlPattern: 'https://stripchat.com/{identifier}',
        isOnlineSelectors: {
            positive: ['video.video-player'],
            negative: ['.offline-indicator']
        },
        ytdlpFlags: ['--cookies-from-browser=chrome'],
        streamlinkFlags: ['--http-header', 'User-Agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'],
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        cookies: true
    },
    'BongaCams': {
        name: 'BongaCams',
        baseUrl: 'https://bongacams.com',
        identifierType: 'username',
        streamUrlPattern: 'https://bongacams.com/{identifier}',
        isOnlineSelectors: {
            positive: ['.live-status.online', '.bc-video__player'],
            negative: ['.live-status.offline']
        },
        ytdlpFlags: ['--cookies-from-browser=chrome'],
        streamlinkFlags: ['--http-header', 'User-Agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'],
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        cookies: true
    },
    'LiveJasmin': {
        name: 'LiveJasmin',
        baseUrl: 'https://livejasmin.com',
        identifierType: 'username',
        streamUrlPattern: 'https://livejasmin.com/en/chat/{identifier}',
        isOnlineSelectors: {
            positive: ['.video-container video', '.status-online'],
            negative: ['.status-offline']
        },
        ytdlpFlags: ['--cookies-from-browser=chrome'],
        streamlinkFlags: ['--http-header', 'User-Agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'],
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        cookies: true
    },
    'MyFreeCams': {
        name: 'MyFreeCams',
        baseUrl: 'https://myfreecams.com',
        identifierType: 'username',
        streamUrlPattern: 'https://myfreecams.com/#/{identifier}',
        isOnlineSelectors: {
            positive: ['#mfc_player', '.model-status-online'],
            negative: ['.model-status-offline']
        },
        ytdlpFlags: ['--cookies-from-browser=chrome'],
        streamlinkFlags: ['--http-header', 'User-Agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'],
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        cookies: true
    },
    'Camsoda': {
        name: 'Camsoda',
        baseUrl: 'https://www.camsoda.com',
        identifierType: 'username',
        streamUrlPattern: 'https://www.camsoda.com/v/{identifier}',
        isOnlineSelectors: {
            positive: ['.stream-player video', '.statusbadge:contains("LIVE")'],
            negative: ['.statusbadge:contains("OFFLINE")']
        },
        ytdlpFlags: ['--cookies-from-browser=chrome'],
        streamlinkFlags: ['--http-header', 'User-Agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'],
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        cookies: true
    }
};
exports.default = platforms;
