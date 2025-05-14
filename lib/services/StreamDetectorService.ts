import puppeteer, { Browser, Page } from 'puppeteer';

// Declare YouTube player response type
declare global {
  interface Window {
    ytInitialPlayerResponse?: {
      streamingData?: {
        hlsManifestUrl?: string;
      };
    };
  }
}

export class StreamDetectorService {
  private browser: Browser | null = null;

  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--ignore-certificate-errors',
          '--ignore-certificate-errors-spki-list',
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
      });
    }
  }

  async detectStream(url: string): Promise<string | null> {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage();
    try {
      // Set a longer timeout
      await page.setDefaultNavigationTimeout(30000);

      // Enable request interception
      await page.setRequestInterception(true);

      // Track potential stream URLs
      let streamUrl: string | null = null;
      const streamUrls: Set<string> = new Set();

      // Handle requests
      page.on('request', async (request) => {
        const url = request.url();
        // Block unnecessary resources
        if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet' || request.resourceType() === 'font') {
          await request.abort();
        } else {
          // Log potential stream URLs
          if (this.isStreamUrl(url)) {
            streamUrls.add(url);
            console.log('Potential stream URL found in request:', url);
          }
          await request.continue();
        }
      });

      // Handle responses
      page.on('response', async (response) => {
        const url = response.url();
        if (this.isStreamUrl(url)) {
          streamUrls.add(url);
          console.log('Potential stream URL found in response:', url);
        }

        // For YouTube, look for specific patterns in XHR responses
        if (url.includes('youtube.com') && response.request().resourceType() === 'xhr') {
          try {
            const text = await response.text();
            if (text.includes('hlsManifestUrl') || text.includes('dashManifestUrl')) {
              const matches = text.match(/"(https:\/\/[^"]+\.m3u8[^"]*)"/g);
              if (matches) {
                matches.forEach(match => {
                  const cleanUrl = match.replace(/"/g, '');
                  streamUrls.add(cleanUrl);
                  console.log('Found HLS URL in YouTube XHR:', cleanUrl);
                });
              }
            }
          } catch (error) {
            console.error('Error parsing response:', error);
          }
        }
      });

      // Navigate to the page
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for potential stream elements
      await Promise.race([
        page.waitForSelector('video', { timeout: 5000 }).catch(() => null),
        page.waitForResponse(response => this.isStreamUrl(response.url()), { timeout: 5000 }).catch(() => null),
        new Promise(resolve => setTimeout(resolve, 5000)) // Fallback timeout
      ]);

      // If no stream URL was found in responses, try to extract from video elements
      if (streamUrls.size === 0) {
        const videoSources = await page.evaluate(() => {
          const sources: string[] = [];
          document.querySelectorAll('video, source').forEach(el => {
            if (el instanceof HTMLVideoElement) {
              if (el.src) sources.push(el.src);
            } else if (el instanceof HTMLSourceElement) {
              if (el.src) sources.push(el.src);
            }
          });
          return sources;
        });

        videoSources.forEach(url => {
          if (this.isStreamUrl(url)) {
            streamUrls.add(url);
          }
        });
      }

      // For YouTube, try to extract from player data
      if (url.includes('youtube.com') && streamUrls.size === 0) {
        const ytStreamUrls = await page.evaluate(() => {
          const ytInitialPlayerResponse = window.ytInitialPlayerResponse;
          if (ytInitialPlayerResponse?.streamingData?.hlsManifestUrl) {
            return [ytInitialPlayerResponse.streamingData.hlsManifestUrl];
          }
          return [];
        });

        ytStreamUrls.forEach(url => streamUrls.add(url));
      }

      // Return the first valid stream URL found
      streamUrl = Array.from(streamUrls)[0] || null;
      return streamUrl;
    } catch (error) {
      console.error(`Error detecting stream for ${url}:`, error);
      return null;
    } finally {
      await page.close();
    }
  }

  private isStreamUrl(url: string): boolean {
    return url.includes('.m3u8') || 
           url.includes('.ts') || 
           url.includes('playlist.m3u8') ||
           url.includes('manifest.mpd') ||
           url.includes('videoplayback') ||
           url.includes('live_stream');
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
} 