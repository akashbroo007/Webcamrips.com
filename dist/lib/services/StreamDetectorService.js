"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamDetectorService = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
class StreamDetectorService {
    constructor() {
        this.browser = null;
    }
    async initialize() {
        if (!this.browser) {
            this.browser = await puppeteer_1.default.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
    }
    async detectStream(url) {
        if (!this.browser) {
            await this.initialize();
        }
        const page = await this.browser.newPage();
        try {
            let streamUrl = null;
            page.on('response', async (response) => {
                const url = response.url();
                if (url.includes('.m3u8')) {
                    streamUrl = url;
                }
            });
            await page.goto(url, { waitUntil: 'networkidle0' });
            return streamUrl;
        }
        finally {
            await page.close();
        }
    }
    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}
exports.StreamDetectorService = StreamDetectorService;
