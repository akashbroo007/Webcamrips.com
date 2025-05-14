"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const playwrightHandler_1 = require("./lib/playwrightHandler");
const path_1 = __importDefault(require("path"));
const logger_1 = require("../lib/utils/logger");
async function testAdultPlaywright() {
    logger_1.logger.info('Starting Adult PlaywrightHandler test...');
    const options = {
        headless: false, // Set to true for production
        screenshots: true,
        screenshotsDir: path_1.default.join(process.cwd(), 'recordings', 'test-screenshots')
    };
    const handler = new playwrightHandler_1.PlaywrightHandler(options);
    try {
        logger_1.logger.info('Initializing browser...');
        await handler.init();
        // Test with a known adult streaming site
        const testUrl = 'https://www.cht.xxx'; // This is just the homepage, not a specific performer
        logger_1.logger.info(`Navigating to ${testUrl}...`);
        await handler.navigateToStream(testUrl);
        logger_1.logger.info('Taking screenshot of homepage...');
        await handler.takeScreenshot('adult-site-homepage');
        // Attempt to extract any stream URLs (even though we're just on the homepage)
        logger_1.logger.info('Attempting to extract stream URLs...');
        const streamUrl = await handler.extractStreamUrl();
        if (streamUrl) {
            logger_1.logger.info(`Found stream URL: ${streamUrl}`);
        }
        else {
            logger_1.logger.info('No stream URL found on homepage (expected)');
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
testAdultPlaywright();
