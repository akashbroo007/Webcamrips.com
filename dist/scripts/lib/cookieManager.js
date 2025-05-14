"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CookieManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../../lib/utils/logger");
/**
 * CookieManager - Handles browser cookies for adult streaming sites
 */
class CookieManager {
    constructor(options = {}) {
        this.options = options;
        this.cookiesDir = options.cookiesDir || path_1.default.join(process.cwd(), 'data', 'cookies');
        // Ensure cookies directory exists
        if (!fs_1.default.existsSync(this.cookiesDir)) {
            fs_1.default.mkdirSync(this.cookiesDir, { recursive: true });
        }
    }
    /**
     * Get the cookie file path for a given domain
     */
    getCookieFilePath(domain) {
        // Clean domain name for filename
        const fileName = domain
            .replace(/^(https?:\/\/)?(www\.)?/, '')
            .replace(/\/$/, '')
            .replace(/[^\w.]/g, '_');
        const extension = this.options.format === 'netscape' ? 'txt' : 'json';
        return path_1.default.join(this.cookiesDir, `${fileName}.${extension}`);
    }
    /**
     * Save cookies from a browser context to file
     */
    async saveCookies(context, domain) {
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
                fs_1.default.writeFileSync(cookiePath, netscapeCookies);
            }
            else {
                // Default JSON format
                fs_1.default.writeFileSync(cookiePath, JSON.stringify(cookies, null, 2));
            }
            logger_1.logger.info(`Saved cookies for ${domain} to ${cookiePath}`);
            return cookiePath;
        }
        catch (error) {
            logger_1.logger.error(`Failed to save cookies for ${domain}`, { error });
            if (error instanceof Error) {
                throw new Error(`Failed to save cookies: ${error.message}`);
            }
            throw new Error('Failed to save cookies: Unknown error');
        }
    }
    /**
     * Load cookies from file into a browser context
     */
    async loadCookies(context, domain) {
        try {
            const cookiePath = this.getCookieFilePath(domain);
            if (!fs_1.default.existsSync(cookiePath)) {
                logger_1.logger.warn(`No cookie file found for ${domain}`);
                return false;
            }
            const content = fs_1.default.readFileSync(cookiePath, 'utf8');
            if (this.options.format === 'netscape') {
                // Parse Netscape format
                const cookies = content
                    .split('\n')
                    .filter(line => line.trim() && !line.startsWith('#'))
                    .map(line => {
                    const parts = line.split('\t');
                    if (parts.length < 7)
                        return null;
                    return {
                        domain: parts[0],
                        path: parts[2],
                        secure: parts[3].toLowerCase() === 'true',
                        expires: parseInt(parts[4]),
                        name: parts[5],
                        value: parts[6],
                        httpOnly: false,
                        sameSite: 'Lax'
                    };
                })
                    .filter((cookie) => cookie !== null);
                await context.addCookies(cookies);
            }
            else {
                // Parse JSON format
                const cookies = JSON.parse(content);
                await context.addCookies(cookies);
            }
            logger_1.logger.info(`Loaded cookies for ${domain} from ${cookiePath}`);
            return true;
        }
        catch (error) {
            logger_1.logger.error(`Failed to load cookies for ${domain}`, { error });
            return false;
        }
    }
    /**
     * Delete cookies for a specific domain
     */
    deleteCookies(domain) {
        try {
            const cookiePath = this.getCookieFilePath(domain);
            if (fs_1.default.existsSync(cookiePath)) {
                fs_1.default.unlinkSync(cookiePath);
                logger_1.logger.info(`Deleted cookies for ${domain}`);
                return true;
            }
            logger_1.logger.warn(`No cookie file found for ${domain}`);
            return false;
        }
        catch (error) {
            logger_1.logger.error(`Failed to delete cookies for ${domain}`, { error });
            return false;
        }
    }
    /**
     * Check if cookies exist for a domain
     */
    hasCookies(domain) {
        const cookiePath = this.getCookieFilePath(domain);
        return fs_1.default.existsSync(cookiePath);
    }
    /**
     * Convert cookies between formats
     */
    convertCookies(domain, targetFormat) {
        try {
            // Temporarily switch format to read in current format
            const currentFormat = this.options.format;
            this.options.format = currentFormat === 'netscape' ? 'json' : 'netscape';
            const sourcePath = this.getCookieFilePath(domain);
            if (!fs_1.default.existsSync(sourcePath)) {
                logger_1.logger.warn(`No cookie file found for ${domain}`);
                this.options.format = currentFormat; // Restore original format
                return false;
            }
            const content = fs_1.default.readFileSync(sourcePath, 'utf8');
            let cookies;
            // Parse based on source format
            if (this.options.format === 'netscape') {
                // Reading JSON, converting to Netscape
                cookies = JSON.parse(content);
            }
            else {
                // Reading Netscape, converting to JSON
                cookies = content
                    .split('\n')
                    .filter(line => line.trim() && !line.startsWith('#'))
                    .map(line => {
                    const parts = line.split('\t');
                    if (parts.length < 7)
                        return null;
                    return {
                        domain: parts[0],
                        path: parts[2],
                        secure: parts[3].toLowerCase() === 'true',
                        expires: parseInt(parts[4]),
                        name: parts[5],
                        value: parts[6],
                        httpOnly: false,
                        sameSite: 'Lax'
                    };
                })
                    .filter(Boolean);
            }
            // Switch to target format and save
            this.options.format = targetFormat;
            const targetPath = this.getCookieFilePath(domain);
            if (targetFormat === 'netscape') {
                // Convert to Netscape format
                const netscapeCookies = cookies.map((cookie) => {
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
                fs_1.default.writeFileSync(targetPath, netscapeCookies);
            }
            else {
                // Convert to JSON format
                fs_1.default.writeFileSync(targetPath, JSON.stringify(cookies, null, 2));
            }
            // Restore original format
            this.options.format = currentFormat;
            logger_1.logger.info(`Converted cookies for ${domain} to ${targetFormat} format`);
            return true;
        }
        catch (error) {
            logger_1.logger.error(`Failed to convert cookies for ${domain}`, { error });
            return false;
        }
    }
}
exports.CookieManager = CookieManager;
