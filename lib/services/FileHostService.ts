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

    // Validate the file exists before attempting uploads
    try {
      this.validateFile(filePath);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Invalid file';
      logger.error(`File validation failed: ${errorMsg}`);
      return [
        { success: false, error: errorMsg, hostName: 'validation' }
      ];
    }

    // Try Mixdrop first (always prioritize Mixdrop)
    try {
      logger.info('Attempting to upload to Mixdrop first');
      const mixdropResult = await this.uploadToMixdrop(filePath);
      results.push(mixdropResult);
      if (mixdropResult.success) {
        logger.info('Mixdrop upload successful');
        // Even if Mixdrop succeeds, we'll still try Gofiles as a backup
        try {
          logger.info('Attempting backup upload to Gofiles');
          const gofilesResult = await this.uploadToGofiles(filePath);
          results.push(gofilesResult);
          if (gofilesResult.success) {
            logger.info('Backup upload to Gofiles successful');
          }
        } catch (gofilesError) {
          logger.warn(`Backup upload to Gofiles failed: ${gofilesError instanceof Error ? gofilesError.message : 'Unknown error'}`);
          // Don't add to results as Mixdrop succeeded
        }
        return results;
      }
    } catch (error) {
      logger.error('Mixdrop upload failed:', error);
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Mixdrop upload failed',
        hostName: 'mixdrop'
      });
    }

    // Only try Gofiles as fallback if Mixdrop fails
    try {
      logger.info('Mixdrop upload failed, trying Gofiles as fallback');
      const gofilesResult = await this.uploadToGofiles(filePath);
      results.push(gofilesResult);
    } catch (error) {
      logger.error('Gofiles upload failed:', error);
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Gofiles upload failed',
        hostName: 'gofiles'
      });
      
      // Log detailed error for debugging
      if (error instanceof AxiosError) {
        logger.error(`Gofiles API Error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      }
    }

    return results;
  }

  private async uploadToGofiles(filePath: string): Promise<UploadResult> {
    if (!this.gofilesToken) {
      logger.warn('Gofiles token not configured');
      return {
        success: false,
        error: 'Gofiles token not configured',
        hostName: 'gofiles'
      };
    }

    try {
      // First try to get a server
      logger.info('Getting Gofiles server for upload');
      const serverResponse = await axios.get('https://api.gofile.io/getServer');
      
      if (serverResponse.data.status !== 'ok') {
        throw new Error(`Failed to get Gofiles server: ${serverResponse.data.status}`);
      }
      
      const server = serverResponse.data.data.server;
      logger.info(`Using Gofiles server: ${server}`);
      
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));
      formData.append('token', this.gofilesToken);

      const response = await axios.post(`https://${server}.gofile.io/uploadFile`, formData, {
        headers: {
          ...formData.getHeaders()
        },
        timeout: 300000 // 5 minute timeout for large files
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
    } catch (error) {
      logger.error(`Error uploading to Gofiles: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        hostName: 'gofiles'
      };
    }
  }

  private async uploadToMixdrop(filePath: string): Promise<UploadResult> {
    if (!this.mixdropEmail || !this.mixdropKey) {
      throw new Error('Mixdrop credentials not configured');
    }

    try {
      // Validate file before upload
      this.validateFile(filePath);
      
      const fileName = path.basename(filePath);
      logger.info(`Starting Mixdrop upload for ${fileName}`);
      
      return await this.retry(async () => {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));
        formData.append('email', this.mixdropEmail);
        formData.append('key', this.mixdropKey);
        
        const response = await axios.post('https://api.mixdrop.co/upload', formData, {
          headers: {
            ...formData.getHeaders()
          },
          timeout: 300000 // 5 minute timeout for large files
        });
        
        if (response.data.success) {
          logger.info(`Successfully uploaded ${fileName} to Mixdrop: ${response.data.url}`);
          return {
            success: true,
            url: response.data.url,
            fileId: response.data.result.fileref,
            hostName: 'mixdrop'
          };
        }
        
        logger.error(`Mixdrop upload failed with message: ${response.data.message || 'Unknown error'}`);
        throw new Error(response.data.message || 'Upload failed');
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error uploading to Mixdrop: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
        hostName: 'mixdrop'
      };
    }
  }
}

const fileHostService = FileHostService.getInstance();
export default fileHostService; 