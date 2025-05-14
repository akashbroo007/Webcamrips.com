"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const playwrightHandler_1 = require("./lib/playwrightHandler");
const path_1 = __importDefault(require("path"));
const logger_1 = require("../lib/utils/logger");
async function testPlaywright() {
    logger_1.logger.info('Starting PlaywrightHandler test...');
    const options = {
        headless: false,
        screenshots: true,
        screenshotsDir: path_1.default.join(process.cwd(), 'recordings', 'test-screenshots')
    };
    const handler = new playwrightHandler_1.PlaywrightHandler(options);
    try {
        logger_1.logger.info('Initializing browser...');
        await handler.init();
        logger_1.logger.info('Navigating to Google...');
        await handler.navigateToStream('https://www.google.com');
        logger_1.logger.info('Taking screenshot...');
        await handler.takeScreenshot('test-screenshot');
        logger_1.logger.info('Test completed successfully!');
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error(`Test failed: ${error instanceof Error ? error.message : String(error)}`);
        await handler.close();
        process.exit(1);
    }
    finally {
        logger_1.logger.info('Closing browser...');
        await handler.close();
    }
}
testPlaywright();
