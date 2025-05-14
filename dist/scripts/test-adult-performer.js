"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const playwrightHandler_1 = require("./lib/playwrightHandler");
const path_1 = __importDefault(require("path"));
const logger_1 = require("../lib/utils/logger");
/**
 * This script tests the PlaywrightHandler with a specific performer page
 * to check if it can successfully navigate, handle age verification, and extract stream URLs.
 */
async function testAdultPerformer() {
    logger_1.logger.info('Starting Adult Performer Test...');
    const options = {
        headless: false, // Set to false for debugging, true for production
        screenshots: true,
        screenshotsDir: path_1.default.join(process.cwd(), 'recordings', 'test-screenshots'),
        timeout: 60000 // Longer timeout for adult sites
    };
    const handler = new playwrightHandler_1.PlaywrightHandler(options);
    try {
        logger_1.logger.info('Initializing browser...');
        await handler.init();
        // Test with a specific performer URL (replace with an active performer if needed)
        const performerUrl = 'https://www.cht.xxx/cuddlymoana/';
        logger_1.logger.info(`Navigating to performer page: ${performerUrl}`);
        await handler.navigateToStream(performerUrl);
        logger_1.logger.info('Taking screenshot of performer page...');
        await handler.takeScreenshot('performer-page');
        // Check if performer is online
        const isOnline = await handler.checkPerformerStatus({
            positive: [
                '.online-status:has-text("Live")',
                '[class*="online"]:has-text("Live")',
                '[class*="live"]:has-text("Live")',
                '[class*="status"]:has-text("Live")'
            ],
            negative: [
                '.offline-status',
                '[class*="offline"]',
                '[class*="status"]:has-text("Offline")'
            ]
        });
        if (isOnline) {
            logger_1.logger.info('Performer is detected as ONLINE');
            // Attempt to extract stream URL
            logger_1.logger.info('Attempting to extract stream URL...');
            const streamUrl = await handler.extractStreamUrl();
            if (streamUrl) {
                logger_1.logger.info(`Successfully extracted stream URL: ${streamUrl}`);
            }
            else {
                logger_1.logger.warn('No stream URL found even though performer is online');
            }
        }
        else {
            logger_1.logger.info('Performer is detected as OFFLINE');
        }
        logger_1.logger.info('Test completed successfully!');
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error(`Test failed: ${error instanceof Error ? error.message : String(error)}`);
        // Still take a screenshot if possible
        try {
            await handler.takeScreenshot('error-screenshot');
        }
        catch {
            // Ignore any errors during error handling
        }
        await handler.close();
        process.exit(1);
    }
    finally {
        logger_1.logger.info('Closing browser...');
        await handler.close();
    }
}
testAdultPerformer();
