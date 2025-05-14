import fs from 'fs';
import path from 'path';
import { BrowserContext } from 'playwright';
import { logger } from '../../lib/utils/logger';

export interface CookieOptions {
  cookiesDir?: string;
  format?: 'json' | 'netscape';
}

/**
 * CookieManager - Handles browser cookies for adult streaming sites
 */
export class CookieManager {
  private readonly options: CookieOptions;
  private readonly cookiesDir: string;

  constructor(options: CookieOptions = {}) {
    this.options = options;
    this.cookiesDir = options.cookiesDir || path.join(process.cwd(), 'data', 'cookies');
    
    // Ensure cookies directory exists
    if (!fs.existsSync(this.cookiesDir)) {
      fs.mkdirSync(this.cookiesDir, { recursive: true });
    }
  }

  /**
   * Get the cookie file path for a given domain
   */
  getCookieFilePath(domain: string): string {
    // Clean domain name for filename
    const fileName = domain
      .replace(/^(https?:\/\/)?(www\.)?/, '')
      .replace(/\/$/, '')
      .replace(/[^\w.]/g, '_');
    
    const extension = this.options.format === 'netscape' ? 'txt' : 'json';
    return path.join(this.cookiesDir, `${fileName}.${extension}`);
  }

  /**
   * Save cookies from a browser context to file
   */
  async saveCookies(context: BrowserContext, domain: string): Promise<string> {
    try {
      const cookies = await context.cookies();
      const cookiePath = this.getCookieFilePath(domain);
      
      if (this.options.format === 'netscape') {
        // Netscape format (for curl, wget, etc.)
        const netscapeCookies = cookies.map(cookie => {
          const expires = cookie.expires === -1 ? 2147483647 : cookie.expires;
          return [
            cookie.domain,
            'TRUE',
            cookie.path,
            cookie.secure ? 'TRUE' : 'FALSE',
            expires,
            cookie.name,
            cookie.value
          ].join('\t');
        }).join('\n');
        
        fs.writeFileSync(cookiePath, netscapeCookies);
      } else {
        // Default JSON format
        fs.writeFileSync(cookiePath, JSON.stringify(cookies, null, 2));
      }
      
      logger.info(`Saved cookies for ${domain} to ${cookiePath}`);
      return cookiePath;
    } catch (error: unknown) {
      logger.error(`Failed to save cookies for ${domain}`, { error });
      if (error instanceof Error) {
        throw new Error(`Failed to save cookies: ${error.message}`);
      }
      throw new Error('Failed to save cookies: Unknown error');
    }
  }

  /**
   * Load cookies from file into a browser context
   */
  async loadCookies(context: BrowserContext, domain: string): Promise<boolean> {
    try {
      const cookiePath = this.getCookieFilePath(domain);
      
      if (!fs.existsSync(cookiePath)) {
        logger.warn(`No cookie file found for ${domain}`);
        return false;
      }
      
      const content = fs.readFileSync(cookiePath, 'utf8');
      
      if (this.options.format === 'netscape') {
        // Parse Netscape format
        const cookies = content
          .split('\n')
          .filter(line => line.trim() && !line.startsWith('#'))
          .map(line => {
            const parts = line.split('\t');
            if (parts.length < 7) return null;
            
            return {
              domain: parts[0],
              path: parts[2],
              secure: parts[3].toLowerCase() === 'true',
              expires: parseInt(parts[4]),
              name: parts[5],
              value: parts[6],
              httpOnly: false,
              sameSite: 'Lax' as const
            };
          })
          .filter((cookie): cookie is NonNullable<typeof cookie> => cookie !== null);
        
        await context.addCookies(cookies);
      } else {
        // Parse JSON format
        const cookies = JSON.parse(content);
        await context.addCookies(cookies);
      }
      
      logger.info(`Loaded cookies for ${domain} from ${cookiePath}`);
      return true;
    } catch (error: unknown) {
      logger.error(`Failed to load cookies for ${domain}`, { error });
      return false;
    }
  }

  /**
   * Delete cookies for a specific domain
   */
  deleteCookies(domain: string): boolean {
    try {
      const cookiePath = this.getCookieFilePath(domain);
      
      if (fs.existsSync(cookiePath)) {
        fs.unlinkSync(cookiePath);
        logger.info(`Deleted cookies for ${domain}`);
        return true;
      }
      
      logger.warn(`No cookie file found for ${domain}`);
      return false;
    } catch (error: unknown) {
      logger.error(`Failed to delete cookies for ${domain}`, { error });
      return false;
    }
  }

  /**
   * Check if cookies exist for a domain
   */
  hasCookies(domain: string): boolean {
    const cookiePath = this.getCookieFilePath(domain);
    return fs.existsSync(cookiePath);
  }

  /**
   * Convert cookies between formats
   */
  convertCookies(domain: string, targetFormat: 'json' | 'netscape'): boolean {
    try {
      // Temporarily switch format to read in current format
      const currentFormat = this.options.format;
      this.options.format = currentFormat === 'netscape' ? 'json' : 'netscape';
      
      const sourcePath = this.getCookieFilePath(domain);
      if (!fs.existsSync(sourcePath)) {
        logger.warn(`No cookie file found for ${domain}`);
        this.options.format = currentFormat; // Restore original format
        return false;
      }
      
      const content = fs.readFileSync(sourcePath, 'utf8');
      let cookies;
      
      // Parse based on source format
      if (this.options.format === 'netscape') {
        // Reading JSON, converting to Netscape
        cookies = JSON.parse(content);
      } else {
        // Reading Netscape, converting to JSON
        cookies = content
          .split('\n')
          .filter(line => line.trim() && !line.startsWith('#'))
          .map(line => {
            const parts = line.split('\t');
            if (parts.length < 7) return null;
            
            return {
              domain: parts[0],
              path: parts[2],
              secure: parts[3].toLowerCase() === 'true',
              expires: parseInt(parts[4]),
              name: parts[5],
              value: parts[6],
              httpOnly: false,
              sameSite: 'Lax' as const
            };
          })
          .filter(Boolean);
      }
      
      // Switch to target format and save
      this.options.format = targetFormat;
      const targetPath = this.getCookieFilePath(domain);
      
      if (targetFormat === 'netscape') {
        // Convert to Netscape format
        const netscapeCookies = cookies.map((cookie: {
          expires: number;
          domain: string;
          path: string;
          secure: boolean;
          name: string;
          value: string;
        }) => {
          const expires = cookie.expires === -1 ? 2147483647 : cookie.expires;
          return [
            cookie.domain,
            'TRUE',
            cookie.path,
            cookie.secure ? 'TRUE' : 'FALSE',
            expires,
            cookie.name,
            cookie.value
          ].join('\t');
        }).join('\n');
        
        fs.writeFileSync(targetPath, netscapeCookies);
      } else {
        // Convert to JSON format
        fs.writeFileSync(targetPath, JSON.stringify(cookies, null, 2));
      }
      
      // Restore original format
      this.options.format = currentFormat;
      
      logger.info(`Converted cookies for ${domain} to ${targetFormat} format`);
      return true;
    } catch (error: unknown) {
      logger.error(`Failed to convert cookies for ${domain}`, { error });
      return false;
    }
  }
} 