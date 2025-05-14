import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileId?: string;
  hostName: string;
}

interface FileHostConfig {
  apiKey?: string;
  email?: string;
  password?: string;
  token?: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB

class FileHostService {
  private static instance: FileHostService;
  private mixdropConfig: FileHostConfig;
  private gofilesConfig: FileHostConfig;
  private gofilesToken: string;
  private mixdropEmail: string;
  private mixdropKey: string;

  private constructor() {
    // Initialize with empty configs
    this.mixdropConfig = {};
    this.gofilesConfig = {};
    this.gofilesToken = process.env.GOFILES_TOKEN || '';
    this.mixdropEmail = process.env.MIXDROP_EMAIL || '';
    this.mixdropKey = process.env.MIXDROP_API_KEY || '';
  }

  public static getInstance(): FileHostService {
    if (!FileHostService.instance) {
      FileHostService.instance = new FileHostService();
    }
    return FileHostService.instance;
  }

  public setMixdropConfig(config: FileHostConfig) {
    this.mixdropConfig = config;
  }

  public setGofilesConfig(config: FileHostConfig) {
    this.gofilesConfig = config;
  }

  private async retry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        logger.warn(`Retrying operation, ${retries} attempts remaining`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return this.retry(fn, retries - 1);
      }
      throw error;
    }
  }

  private validateFile(filePath: string): void {
    if (!fs.existsSync(filePath)) {
      throw new Error('File does not exist');
    }

    const stats = fs.statSync(filePath);
    if (stats.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024 / 1024}GB`);
    }
  }

  async uploadToMultipleHosts(filePath: string): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    // Try Gofiles first
    try {
      const gofilesResult = await this.uploadToGofiles(filePath);
      results.push(gofilesResult);
      if (gofilesResult.success) {
        return results;
      }
    } catch (error) {
      console.error('Gofiles upload failed:', error);
      results.push({
        success: false,
        error: 'Gofiles upload failed',
        hostName: 'gofiles'
      });
    }

    // If Gofiles fails, try Mixdrop
    try {
      const mixdropResult = await this.uploadToMixdrop(filePath);
      results.push(mixdropResult);
    } catch (error) {
      console.error('Mixdrop upload failed:', error);
      results.push({
        success: false,
        error: 'Mixdrop upload failed',
        hostName: 'mixdrop'
      });
    }

    return results;
  }

  private async uploadToGofiles(filePath: string): Promise<UploadResult> {
    if (!this.gofilesToken) {
      throw new Error('Gofiles token not configured');
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('token', this.gofilesToken);

    const response = await axios.post('https://api.gofile.io/uploadFile', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    if (response.data.status === 'ok') {
      return {
        success: true,
        url: response.data.data.downloadPage,
        fileId: response.data.data.fileId,
        hostName: 'gofiles'
      };
    }

    return {
      success: false,
      error: response.data.message || 'Upload failed',
      hostName: 'gofiles'
    };
  }

  private async uploadToMixdrop(filePath: string): Promise<UploadResult> {
    if (!this.mixdropEmail || !this.mixdropKey) {
      throw new Error('Mixdrop credentials not configured');
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('email', this.mixdropEmail);
    formData.append('key', this.mixdropKey);

    const response = await axios.post('https://api.mixdrop.co/upload', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    if (response.data.success) {
      return {
        success: true,
        url: response.data.url,
        fileId: response.data.result.fileref,
        hostName: 'mixdrop'
      };
    }

    return {
      success: false,
      error: response.data.message || 'Upload failed',
      hostName: 'mixdrop'
    };
  }
}

const fileHostService = FileHostService.getInstance();
export default fileHostService; 