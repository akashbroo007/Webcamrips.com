"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaywrightHandler = void 0;
const playwright_1 = require("playwright");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../../lib/utils/logger");
/**
 * PlaywrightHandler - Manages browser automation for adult streaming sites
 */
class PlaywrightHandler {
    constructor(options = {}) {
        this.browser = null;
        this.context = null;
        this.page = null;
        this.DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';
        this.options = {
            headless: options.headless ?? true,
            userAgent: options.userAgent ?? this.DEFAULT_USER_AGENT,
            viewport: options.viewport ?? { width: 1920, height: 1080 },
            timeout: options.timeout ?? 60000,
            screenshots: options.screenshots ?? true,
            screenshotsDir: options.screenshotsDir ?? path_1.default.join(process.cwd(), 'recordings', 'screenshots')
        };
        // Ensure screenshots directory exists
        if (this.options.screenshots && this.options.screenshotsDir) {
            if (!fs_1.default.existsSync(this.options.screenshotsDir)) {
                fs_1.default.mkdirSync(this.options.screenshotsDir, { recursive: true });
            }
        }
    }
    /**
     * Initialize the browser
     */
    async init() {
        try {
            // Try Firefox first as it generally works better with adult sites
            try {
                this.browser = await playwright_1.firefox.launch({
                    headless: this.options.headless
                });
            }
            catch (error) {
                logger_1.logger.warn('Failed to launch Firefox, falling back to Chromium', { error });
                this.browser = await playwright_1.chromium.launch({
                    headless: this.options.headless
                });
            }
            this.context = await this.browser.newContext({
                viewport: this.options.viewport,
                userAgent: this.options.userAgent,
                // Accept cookies and handle adult content
                acceptDownloads: true,
                ignoreHTTPSErrors: true,
                // Permissions for both browser types
                permissions: ['geolocation', 'notifications']
            });
            // Add cookie handling logging
            this.context.on('request', request => {
                const url = request.url();
                if (url.includes('cookie') || url.includes('consent')) {
                    logger_1.logger.debug(`Request to cookie/consent URL: ${url}`);
                }
            });
            this.page = await this.context.newPage();
            // Set up error handling
            this.page.on('console', msg => {
                if (msg.type() === 'error' || msg.type() === 'warning') {
                    logger_1.logger.debug(`Browser console ${msg.type()}: ${msg.text()}`);
                }
            });
            // Handle dialogs automatically (accept all alerts, confirms, etc.)
            this.page.on('dialog', async (dialog) => {
                logger_1.logger.info(`Auto-accepting dialog: ${dialog.message()}`);
                await dialog.accept();
            });
            logger_1.logger.info('Browser initialized successfully');
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize browser', { error });
            throw new Error(`Browser initialization failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Navigate to a URL and handle age verification/consent dialogs
     */
    async navigateToStream(url) {
        if (!this.page) {
            throw new Error('Browser not initialized');
        }
        try {
            logger_1.logger.info(`Navigating to ${url}`);
            // Navigate with a longer timeout for adult sites
            await this.page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: this.options.timeout
            });
            // Wait a bit for any scripts to load
            await this.page.waitForTimeout(3000);
            // Handle common age verification patterns
            await this.handleAgeVerification();
            // Wait a bit more after handling gates
            await this.page.waitForTimeout(2000);
            logger_1.logger.info('Navigation completed');
        }
        catch (error) {
            logger_1.logger.error('Navigation failed', { url, error });
            // Take screenshot on error if enabled
            if (this.options.screenshots) {
                await this.takeScreenshot(`navigation-error-${new Date().getTime()}`);
            }
            throw new Error(`Failed to navigate to ${url}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Handle age verification and consent dialogs
     */
    async handleAgeVerification() {
        if (!this.page)
            return;
        try {
            // Common age verification button texts and selectors
            const ageVerificationSelectors = [
                // Text-based buttons
                'button:has-text("I am over 18")',
                'button:has-text("I am 18 or older")',
                'button:has-text("I am at least 18")',
                'button:has-text("I am 18+")',
                'button:has-text("Enter")',
                'button:has-text("Continue")',
                'button:has-text("Yes")',
                'button:has-text("Accept")',
                'button:has-text("I agree")',
                'button:has-text("I understand")',
                // Common age verification IDs/classes
                '[id*="age-verification"] button',
                '[class*="age-verification"] button',
                '[id*="verify-age"] button',
                '[class*="verify-age"] button',
                '[id*="adult-content"] button',
                '[class*="adult-content"] button',
                // Cookie consent buttons
                'button:has-text("Accept All Cookies")',
                'button:has-text("Accept Cookies")',
                '[id*="cookie-consent"] button',
                '[class*="cookie-consent"] button',
                '[id*="cookie-banner"] button[id*="accept"]',
                '[class*="cookie-banner"] button[class*="accept"]'
            ];
            // Try each selector
            for (const selector of ageVerificationSelectors) {
                // Check if the element exists
                const exists = await this.page.$(selector);
                if (exists) {
                    logger_1.logger.info(`Found age verification element: ${selector}`);
                    await this.page.click(selector).catch(() => { });
                    // Wait a bit after clicking
                    await this.page.waitForTimeout(1000);
                }
            }
            // Check for iframe-based age verifications
            const frames = this.page.frames();
            for (const frame of frames) {
                for (const selector of ageVerificationSelectors) {
                    try {
                        const exists = await frame.$(selector);
                        if (exists) {
                            logger_1.logger.info(`Found age verification in iframe: ${selector}`);
                            await frame.click(selector).catch(() => { });
                            await this.page.waitForTimeout(1000);
                        }
                    }
                    catch (error) {
                        // Ignore frame errors
                    }
                }
            }
        }
        catch (error) {
            logger_1.logger.warn('Error handling age verification', { error });
            // Continue anyway
        }
    }
    /**
     * Extract HLS stream URL using browser debugging
     */
    async extractStreamUrl() {
        if (!this.page)
            return null;
        try {
            // Look for .m3u8 URLs in network requests
            const client = await this.page.context().newCDPSession(this.page);
            await client.send('Network.enable');
            // Clear previous requests and wait for new ones
            logger_1.logger.info('Monitoring network requests for .m3u8 streams...');
            // Reload the page to capture new requests
            await this.page.reload({ waitUntil: 'networkidle' });
            // Set up listener for response received event
            const streamUrls = [];
            client.on('Network.responseReceived', async (event) => {
                const url = event.response.url;
                if (url.includes('.m3u8') || url.includes('/hls/')) {
                    streamUrls.push(url);
                    logger_1.logger.info(`Found HLS stream URL: ${url}`);
                }
            });
            // Wait for potential HLS streams to load
            await this.page.waitForTimeout(5000);
            // Also look for HTML5 video elements with src
            const videoSources = await this.page.evaluate(() => {
                const sources = [];
                // Check video elements
                document.querySelectorAll('video').forEach(video => {
                    if (video.src)
                        sources.push(video.src);
                });
                // Check source elements
                document.querySelectorAll('source').forEach(source => {
                    if (source.src)
                        sources.push(source.src);
                });
                return sources;
            });
            // Add video sources found
            videoSources.forEach(src => {
                if (!streamUrls.includes(src)) {
                    streamUrls.push(src);
                    logger_1.logger.info(`Found HTML5 video source: ${src}`);
                }
            });
            // Look in page response bodies for m3u8 URLs
            const m3u8Regex = /(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/g;
            const pageContent = await this.page.content();
            const m3u8Matches = pageContent.match(m3u8Regex);
            if (m3u8Matches) {
                m3u8Matches.forEach(url => {
                    if (!streamUrls.includes(url)) {
                        streamUrls.push(url);
                        logger_1.logger.info(`Found m3u8 URL in page content: ${url}`);
                    }
                });
            }
            // Return the first stream URL found
            return streamUrls.length > 0 ? streamUrls[0] : null;
        }
        catch (error) {
            logger_1.logger.error('Failed to extract stream URL', { error });
            return null;
        }
    }
    /**
     * Check if the performer is online
     */
    async checkPerformerStatus(selectors) {
        if (!this.page)
            return false;
        try {
            // Check positive selectors (elements that should exist if stream is online)
            for (const selector of selectors.positive) {
                const element = await this.page.$(selector);
                if (!element) {
                    logger_1.logger.info(`Missing positive selector: ${selector}`);
                    return false;
                }
                logger_1.logger.info(`Found positive selector: ${selector}`);
            }
            // Check negative selectors (elements that should NOT exist if stream is online)
            for (const selector of selectors.negative) {
                const element = await this.page.$(selector);
                if (element) {
                    logger_1.logger.info(`Found negative selector: ${selector} (indicating stream is offline)`);
                    return false;
                }
            }
            return true;
        }
        catch (error) {
            logger_1.logger.error('Error checking performer status', { error });
            return false;
        }
    }
    /**
     * Take a screenshot
     */
    async takeScreenshot(name) {
        if (!this.page || !this.options.screenshots)
            return null;
        try {
            const filename = `${name.replace(/[^\w-]/g, '_')}-${new Date().getTime()}.png`;
            const screenshotPath = path_1.default.join(this.options.screenshotsDir, filename);
            await this.page.screenshot({ path: screenshotPath, fullPage: false });
            logger_1.logger.info(`Screenshot saved to ${screenshotPath}`);
            return screenshotPath;
        }
        catch (error) {
            logger_1.logger.error('Error taking screenshot', { error });
            return null;
        }
    }
    /**
     * Save cookies for the current session
     */
    async saveCookies(cookiePath) {
        if (!this.context)
            return;
        try {
            const cookies = await this.context.cookies();
            const cookiesDir = path_1.default.dirname(cookiePath);
            if (!fs_1.default.existsSync(cookiesDir)) {
                fs_1.default.mkdirSync(cookiesDir, { recursive: true });
            }
            fs_1.default.writeFileSync(cookiePath, JSON.stringify(cookies, null, 2));
            logger_1.logger.info(`Cookies saved to ${cookiePath}`);
        }
        catch (error) {
            logger_1.logger.error('Error saving cookies', { error });
        }
    }
    /**
     * Load cookies for the current session
     */
    async loadCookies(cookiePath) {
        if (!this.context)
            return;
        try {
            if (fs_1.default.existsSync(cookiePath)) {
                const cookies = JSON.parse(fs_1.default.readFileSync(cookiePath, 'utf8'));
                await this.context.addCookies(cookies);
                logger_1.logger.info(`Cookies loaded from ${cookiePath}`);
            }
            else {
                logger_1.logger.warn(`Cookie file not found: ${cookiePath}`);
            }
        }
        catch (error) {
            logger_1.logger.error('Error loading cookies', { error });
        }
    }
    /**
     * Clean up and close browser
     */
    async close() {
        try {
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
                this.context = null;
                this.page = null;
                logger_1.logger.info('Browser closed');
            }
        }
        catch (error) {
            logger_1.logger.warn('Error while closing browser', { error });
        }
    }
}
exports.PlaywrightHandler = PlaywrightHandler;
