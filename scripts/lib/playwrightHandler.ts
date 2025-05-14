import { chromium, firefox, Browser, BrowserContext, Page } from 'playwright';
import fs from 'fs';
import path from 'path';
import { logger } from '../../lib/utils/logger';

export interface BrowserOptions {
  headless?: boolean;
  userAgent?: string;
  viewport?: { width: number; height: number };
  timeout?: number;
  screenshots?: boolean;
  screenshotsDir?: string;
}

export interface StreamInfo {
  isOnline: boolean;
  streamUrl?: string;
  hlsUrl?: string;
  performerName?: string;
  platform?: string;
  screenshotPath?: string;
  error?: string;
}

/**
 * PlaywrightHandler - Manages browser automation for adult streaming sites
 */
export class PlaywrightHandler {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private options: BrowserOptions;
  private readonly DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

  constructor(options: BrowserOptions = {}) {
    this.options = {
      headless: options.headless ?? true,
      userAgent: options.userAgent ?? this.DEFAULT_USER_AGENT,
      viewport: options.viewport ?? { width: 1920, height: 1080 },
      timeout: options.timeout ?? 60000,
      screenshots: options.screenshots ?? true,
      screenshotsDir: options.screenshotsDir ?? path.join(process.cwd(), 'recordings', 'screenshots')
    };

    // Ensure screenshots directory exists
    if (this.options.screenshots && this.options.screenshotsDir) {
      if (!fs.existsSync(this.options.screenshotsDir)) {
        fs.mkdirSync(this.options.screenshotsDir, { recursive: true });
      }
    }
  }

  /**
   * Initialize the browser
   */
  async init(): Promise<void> {
    try {
      // Try Firefox first as it generally works better with adult sites
      try {
        this.browser = await firefox.launch({
          headless: this.options.headless
        });
      } catch (error: unknown) {
        logger.warn('Failed to launch Firefox, falling back to Chromium', { error });
        this.browser = await chromium.launch({
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
          logger.debug(`Request to cookie/consent URL: ${url}`);
        }
      });
      
      this.page = await this.context.newPage();
      
      // Set up error handling
      this.page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
          logger.debug(`Browser console ${msg.type()}: ${msg.text()}`);
        }
      });
      
      // Handle dialogs automatically (accept all alerts, confirms, etc.)
      this.page.on('dialog', async dialog => {
        logger.info(`Auto-accepting dialog: ${dialog.message()}`);
        await dialog.accept();
      });
      
      logger.info('Browser initialized successfully');
    } catch (error: unknown) {
      logger.error('Failed to initialize browser', { error });
      throw new Error(`Browser initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Navigate to a URL and handle age verification/consent dialogs
   */
  async navigateToStream(url: string): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    try {
      logger.info(`Navigating to ${url}`);
      
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
      
      logger.info('Navigation completed');
    } catch (error: unknown) {
      logger.error('Navigation failed', { url, error });
      
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
  async handleAgeVerification(): Promise<void> {
    if (!this.page) return;
    
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
          logger.info(`Found age verification element: ${selector}`);
          await this.page.click(selector).catch(() => {});
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
              logger.info(`Found age verification in iframe: ${selector}`);
              await frame.click(selector).catch(() => {});
              await this.page.waitForTimeout(1000);
            }
          } catch (error: unknown) {
            // Ignore frame errors
          }
        }
      }
    } catch (error: unknown) {
      logger.warn('Error handling age verification', { error });
      // Continue anyway
    }
  }

  /**
   * Extract HLS stream URL using browser debugging
   */
  async extractStreamUrl(): Promise<string | null> {
    if (!this.page) return null;
    
    try {
      // Look for .m3u8 URLs in network requests
      const client = await this.page.context().newCDPSession(this.page);
      await client.send('Network.enable');
      
      // Clear previous requests and wait for new ones
      logger.info('Monitoring network requests for .m3u8 streams...');
      
      // Reload the page to capture new requests
      await this.page.reload({ waitUntil: 'networkidle' });
      
      // Set up listener for response received event
      const streamUrls: string[] = [];
      client.on('Network.responseReceived', async (event) => {
        const url = event.response.url;
        if (url.includes('.m3u8') || url.includes('/hls/')) {
          streamUrls.push(url);
          logger.info(`Found HLS stream URL: ${url}`);
        }
      });
      
      // Wait for potential HLS streams to load
      await this.page.waitForTimeout(5000);
      
      // Also look for HTML5 video elements with src
      const videoSources = await this.page.evaluate(() => {
        const sources: string[] = [];
        // Check video elements
        document.querySelectorAll('video').forEach(video => {
          if (video.src) sources.push(video.src);
        });
        // Check source elements
        document.querySelectorAll('source').forEach(source => {
          if (source.src) sources.push(source.src);
        });
        return sources;
      });
      
      // Add video sources found
      videoSources.forEach(src => {
        if (!streamUrls.includes(src)) {
          streamUrls.push(src);
          logger.info(`Found HTML5 video source: ${src}`);
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
            logger.info(`Found m3u8 URL in page content: ${url}`);
          }
        });
      }
      
      // Return the first stream URL found
      return streamUrls.length > 0 ? streamUrls[0] : null;
    } catch (error: unknown) {
      logger.error('Failed to extract stream URL', { error });
      return null;
    }
  }

  /**
   * Check if the performer is online
   */
  async checkPerformerStatus(selectors: { positive: string[], negative: string[] }): Promise<boolean> {
    if (!this.page) return false;
    
    try {
      // Check positive selectors (elements that should exist if stream is online)
      for (const selector of selectors.positive) {
        const element = await this.page.$(selector);
        if (!element) {
          logger.info(`Missing positive selector: ${selector}`);
          return false;
        }
        logger.info(`Found positive selector: ${selector}`);
      }
      
      // Check negative selectors (elements that should NOT exist if stream is online)
      for (const selector of selectors.negative) {
        const element = await this.page.$(selector);
        if (element) {
          logger.info(`Found negative selector: ${selector} (indicating stream is offline)`);
          return false;
        }
      }
      
      return true;
    } catch (error: unknown) {
      logger.error('Error checking performer status', { error });
      return false;
    }
  }

  /**
   * Take a screenshot
   */
  async takeScreenshot(name: string): Promise<string | null> {
    if (!this.page || !this.options.screenshots) return null;
    
    try {
      const filename = `${name.replace(/[^\w-]/g, '_')}-${new Date().getTime()}.png`;
      const screenshotPath = path.join(this.options.screenshotsDir!, filename);
      
      await this.page.screenshot({ path: screenshotPath, fullPage: false });
      logger.info(`Screenshot saved to ${screenshotPath}`);
      
      return screenshotPath;
    } catch (error: unknown) {
      logger.error('Error taking screenshot', { error });
      return null;
    }
  }

  /**
   * Save cookies for the current session
   */
  async saveCookies(cookiePath: string): Promise<void> {
    if (!this.context) return;
    
    try {
      const cookies = await this.context.cookies();
      const cookiesDir = path.dirname(cookiePath);
      
      if (!fs.existsSync(cookiesDir)) {
        fs.mkdirSync(cookiesDir, { recursive: true });
      }
      
      fs.writeFileSync(cookiePath, JSON.stringify(cookies, null, 2));
      logger.info(`Cookies saved to ${cookiePath}`);
    } catch (error: unknown) {
      logger.error('Error saving cookies', { error });
    }
  }

  /**
   * Load cookies for the current session
   */
  async loadCookies(cookiePath: string): Promise<void> {
    if (!this.context) return;
    
    try {
      if (fs.existsSync(cookiePath)) {
        const cookies = JSON.parse(fs.readFileSync(cookiePath, 'utf8'));
        await this.context.addCookies(cookies);
        logger.info(`Cookies loaded from ${cookiePath}`);
      } else {
        logger.warn(`Cookie file not found: ${cookiePath}`);
      }
    } catch (error: unknown) {
      logger.error('Error loading cookies', { error });
    }
  }

  /**
   * Clean up and close browser
   */
  async close(): Promise<void> {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.context = null;
        this.page = null;
        logger.info('Browser closed');
      }
    } catch (error: unknown) {
      logger.warn('Error while closing browser', { error });
    }
  }
} 