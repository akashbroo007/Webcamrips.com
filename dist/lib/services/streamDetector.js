"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const logger_1 = require("@/lib/utils/logger");
const Performer_1 = __importDefault(require("@/lib/models/Performer"));
/**
 * Service to detect if a performer is currently streaming
 */
class StreamDetectorService {
    /**
     * Check if a performer is streaming on Chaturbate
     */
    async checkChaturbateStream(channelId) {
        const url = `https://chaturbate.com/${channelId}/`;
        let browser;
        try {
            browser = await puppeteer_1.default.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36');
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
            // Check if the performer is online by looking for specific elements that indicate livestream
            const isOnlineIndicator = await page.evaluate(() => {
                // Check for the presence of video element or specific online indicators
                const videoElement = document.querySelector('#still_video_object');
                const offlineMessage = document.querySelector('.offline_tipping');
                return !!videoElement && !offlineMessage;
            });
            return {
                isOnline: isOnlineIndicator,
                streamUrl: isOnlineIndicator ? url : undefined,
                detectedAt: new Date()
            };
        }
        catch (error) {
            logger_1.logger.error(`Error checking Chaturbate stream for ${channelId}:`, error);
            return {
                isOnline: false,
                detectedAt: new Date()
            };
        }
        finally {
            if (browser) {
                await browser.close();
            }
        }
    }
    /**
     * Check if a performer is streaming on Stripchat
     */
    async checkStripchatStream(channelId) {
        const url = `https://stripchat.com/${channelId}`;
        let browser;
        try {
            browser = await puppeteer_1.default.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36');
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
            // Check if the performer is online
            const isOnlineIndicator = await page.evaluate(() => {
                // Look for elements that indicate the model is streaming
                const videoElement = document.querySelector('video.video-player');
                const offlineIndicator = document.querySelector('.offline-indicator');
                return !!videoElement && !offlineIndicator;
            });
            return {
                isOnline: isOnlineIndicator,
                streamUrl: isOnlineIndicator ? url : undefined,
                detectedAt: new Date()
            };
        }
        catch (error) {
            logger_1.logger.error(`Error checking Stripchat stream for ${channelId}:`, error);
            return {
                isOnline: false,
                detectedAt: new Date()
            };
        }
        finally {
            if (browser) {
                await browser.close();
            }
        }
    }
    /**
     * Generic method to check if a performer is online based on platform
     */
    async checkPerformerStatus(performer) {
        const results = new Map();
        if (!performer.platforms || performer.platforms.length === 0) {
            logger_1.logger.warn(`No platforms configured for performer ${performer.name}`);
            return results;
        }
        for (const platform of performer.platforms) {
            try {
                let status;
                switch (platform.platform) {
                    case 'Chaturbate':
                        status = await this.checkChaturbateStream(platform.channelId);
                        break;
                    case 'Stripchat':
                        status = await this.checkStripchatStream(platform.channelId);
                        break;
                    default:
                        logger_1.logger.warn(`Platform ${platform.platform} not supported for detection`);
                        status = {
                            isOnline: false,
                            detectedAt: new Date()
                        };
                }
                results.set(platform.platform, status);
                // Update the performer's lastSeen status if they're online
                if (status.isOnline) {
                    await Performer_1.default.findByIdAndUpdate(performer._id, {
                        lastSeen: new Date()
                    });
                    logger_1.logger.info(`Performer ${performer.name} detected online on ${platform.platform}`);
                }
            }
            catch (error) {
                logger_1.logger.error(`Error checking status for ${performer.name} on ${platform.platform}:`, error);
                results.set(platform.platform, {
                    isOnline: false,
                    detectedAt: new Date()
                });
            }
        }
        return results;
    }
    /**
     * Check all active performers
     */
    async checkAllActivePerformers() {
        const performers = await Performer_1.default.find({ isActive: true });
        const results = new Map();
        logger_1.logger.info(`Checking status for ${performers.length} active performers`);
        for (const performer of performers) {
            try {
                const performerStatus = await this.checkPerformerStatus(performer);
                results.set(performer.name, performerStatus);
            }
            catch (error) {
                logger_1.logger.error(`Error checking status for performer ${performer.name}:`, error);
            }
        }
        return results;
    }
}
exports.default = new StreamDetectorService();
