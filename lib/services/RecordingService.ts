import { StreamDetectorService } from './StreamDetectorService';
import RecordingConfig, { IRecordingConfig } from '../models/RecordingConfig';
import Recording from '../models/Recording';
import { spawn } from 'child_process';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Storage } from '@google-cloud/storage';
import { BlobServiceClient } from '@azure/storage-blob';
import fileHostService from './FileHostService';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

interface RecordingOptions {
  streamUrl: string;
  modelName: string;
  platform: string;
  quality?: string;
  maxDuration?: number;
}

class RecordingService {
  private static streamDetector: StreamDetectorService = new StreamDetectorService();
  private static activeRecordings: Map<string, any> = new Map();

  constructor() {
    // Initialize if needed
  }

  static async startRecording(options: RecordingOptions) {
    try {
      // Save recording to database
      const recordingId = uuidv4();
      const recording = new Recording({
        modelName: options.modelName,
        platform: options.platform,
        streamUrl: options.streamUrl,
        status: 'scheduled',
        duration: options.maxDuration || 7200, // Default 2 hours
        startTime: new Date(),
        processId: recordingId
      });
      
      await recording.save();
      
      logger.info(`Started recording for ${options.modelName} (${recording._id})`);

      // Initialize stream detector if not already
      await this.streamDetector.initialize();

      // Detect stream URL
      const streamUrl = await this.streamDetector.detectStream(options.streamUrl);
      if (!streamUrl) {
        recording.status = 'failed';
        recording.error = 'No stream detected';
        await recording.save();
        throw new Error('No stream detected');
      }

      // Update recording status
      recording.status = 'recording';
      await recording.save();

      // Generate output filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputFilename = `${options.modelName}_${timestamp}.mp4`;
      const localPath = path.join(process.cwd(), 'temp', outputFilename);

      // Ensure temp directory exists
      if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
        fs.mkdirSync(path.join(process.cwd(), 'temp'), { recursive: true });
      }

      // Start recording using yt-dlp
      const ytdlp = spawn('yt-dlp', [
        streamUrl,
        '-o', localPath,
        '--format', options.quality || 'best',
        '--no-part',
        '--hls-use-mpegts'
      ]);

      // Store recording process
      this.activeRecordings.set(recordingId, {
        process: ytdlp,
        recording,
        localPath
      });

      // Handle process events
      ytdlp.on('close', async (code) => {
        try {
          if (code === 0) {
            // Get file size
            const stats = fs.statSync(localPath);
            
            // Update recording
            recording.filePath = localPath;
            recording.fileSize = stats.size;
            recording.endTime = new Date();
            recording.status = 'completed';
            recording.uploadStatus = 'pending';
            await recording.save();

            // Upload to file hosting services
            recording.uploadStatus = 'uploading';
            await recording.save();
            
            const uploadResults = await fileHostService.uploadToMultipleHosts(localPath);
            logger.info('File hosting upload results:', uploadResults);

            // Update with upload results
            if (uploadResults.length > 0) {
              // Find successful uploads for each host
              const mixdropUpload = uploadResults.find(r => r.success && r.hostName === 'mixdrop');
              const gofilesUpload = uploadResults.find(r => r.success && r.hostName === 'gofiles');
              
              if (mixdropUpload || gofilesUpload) {
                recording.uploadStatus = 'completed';
                
                // Create Video entry in database
                const Video = (await import('../models/Video')).default;
                const Performer = (await import('../models/Performer')).default;
                
                // Find or create performer
                let performer = await Performer.findOne({ name: options.modelName });
                if (!performer) {
                  performer = new Performer({
                    name: options.modelName,
                    platform: options.platform
                  });
                  await performer.save();
                }
                
                // Create video entry
                const video = new Video({
                  title: `${options.modelName} - ${options.platform} - ${new Date().toISOString().split('T')[0]}`,
                  description: `Recorded webcam video of ${options.modelName} from ${options.platform}`,
                  mixdropUrl: mixdropUpload?.url || null,
                  gofilesUrl: gofilesUpload?.url || null,
                  duration: Math.floor((recording.endTime.getTime() - recording.startTime.getTime()) / 1000),
                  performer: performer._id,
                  platform: options.platform,
                  contentId: gofilesUpload?.fileId || mixdropUpload?.fileId || null,
                  tags: [options.platform, 'webcam', 'recording']
                });
                
                await video.save();
                
                // Link recording to video - use string representation to avoid type issues
                recording.videoId = video._id as any;
                logger.info(`Created video entry: ${video._id} for recording ${recording._id}`);
              } else {
                recording.uploadStatus = 'failed';
                recording.error = 'Failed to upload to any hosting service';
              }
            } else {
              recording.uploadStatus = 'failed';
              recording.error = 'No upload results received';
            }
            
            await recording.save();

            // Clean up local file after all uploads are complete
            fs.unlinkSync(localPath);
          } else {
            recording.status = 'failed';
            recording.error = `Process exited with code ${code}`;
            await recording.save();
          }
        } catch (error) {
          logger.error('Error handling recording completion:', error);
          recording.status = 'failed';
          recording.error = `Error: ${error instanceof Error ? error.message : String(error)}`;
          await recording.save();
        }
        
        this.activeRecordings.delete(recordingId);
      });

      return { success: true, id: recordingId, recordingId: recording._id };
    } catch (error) {
      logger.error('Error starting recording:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  static async stopRecording(recordingId: string) {
    const recording = this.activeRecordings.get(recordingId);
    if (recording) {
      recording.process.kill();
      this.activeRecordings.delete(recordingId);
      
      // Update recording in database
      try {
        const recordingDoc = await Recording.findById(recording.recording._id);
        if (recordingDoc) {
          recordingDoc.status = 'completed';
          recordingDoc.endTime = new Date();
          await recordingDoc.save();
        }
      } catch (error) {
        logger.error('Error updating recording status:', error);
      }
      
      return true;
    }
    return false;
  }

  private async uploadToCloud(config: IRecordingConfig, localPath: string) {
    try {
      const filename = path.basename(localPath);
      const cloudPath = path.join(config.cloudStorage.path, filename);

      switch (config.cloudStorage.provider) {
        case 's3':
          await this.uploadToS3(config.cloudStorage.bucket, cloudPath, localPath);
          break;
        case 'gcs':
          await this.uploadToGCS(config.cloudStorage.bucket, cloudPath, localPath);
          break;
        case 'azure':
          await this.uploadToAzure(config.cloudStorage.bucket, cloudPath, localPath);
          break;
      }
    } catch (error) {
      logger.error('Error uploading to cloud:', error);
    }
  }

  private async uploadToS3(bucket: string, key: string, localPath: string) {
    const client = new S3Client({});
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fs.createReadStream(localPath)
    });
    await client.send(command);
  }

  private async uploadToGCS(bucket: string, key: string, localPath: string) {
    const storage = new Storage();
    await storage.bucket(bucket).upload(localPath, {
      destination: key
    });
  }

  private async uploadToAzure(container: string, blobName: string, localPath: string) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING || '');
    const containerClient = blobServiceClient.getContainerClient(container);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadFile(localPath);
  }

  async checkActiveStreams(): Promise<void> {
    try {
      const configs = await RecordingConfig.find({ isActive: true });
      for (const config of configs) {
        const isRecording = RecordingService.activeRecordings.has(config._id.toString());
        if (!isRecording) {
          const streamUrl = await RecordingService.streamDetector.detectStream(config.streamUrl);
          if (streamUrl) {
            await RecordingService.startRecording({
              streamUrl: config.streamUrl,
              modelName: config.modelName,
              platform: config.platform,
              quality: config.recordingQuality
            });
          }
        }
      }
    } catch (error) {
      logger.error('Error checking active streams:', error);
    }
  }

  async checkPendingUploads(): Promise<void> {
    try {
      // Check database for pending uploads
      const pendingRecordings = await Recording.find({ 
        status: 'completed',
        uploadStatus: 'pending'
      });
      
      for (const recording of pendingRecordings) {
        if (recording.filePath && fs.existsSync(recording.filePath)) {
          try {
            recording.uploadStatus = 'uploading';
            await recording.save();
            
            const uploadResults = await fileHostService.uploadToMultipleHosts(recording.filePath);
            logger.info('Pending upload completed:', uploadResults);
            
            // Update with upload results
            if (uploadResults.length > 0) {
              // Find successful uploads for each host
              const mixdropUpload = uploadResults.find(r => r.success && r.hostName === 'mixdrop');
              const gofilesUpload = uploadResults.find(r => r.success && r.hostName === 'gofiles');
              
              if (mixdropUpload || gofilesUpload) {
                recording.uploadStatus = 'completed';
                
                // Create Video entry in database
                const Video = (await import('../models/Video')).default;
                const Performer = (await import('../models/Performer')).default;
                
                // Find or create performer
                let performer = await Performer.findOne({ name: recording.modelName });
                if (!performer) {
                  performer = new Performer({
                    name: recording.modelName,
                    platform: recording.platform
                  });
                  await performer.save();
                }
                
                // Create video entry
                const video = new Video({
                  title: `${recording.modelName} - ${recording.platform} - ${new Date().toISOString().split('T')[0]}`,
                  description: `Recorded webcam video of ${recording.modelName} from ${recording.platform}`,
                  mixdropUrl: mixdropUpload?.url || null,
                  gofilesUrl: gofilesUpload?.url || null,
                  duration: recording.endTime 
                    ? Math.floor((recording.endTime.getTime() - recording.startTime.getTime()) / 1000)
                    : recording.duration || 0,
                  performer: performer._id,
                  platform: recording.platform,
                  contentId: gofilesUpload?.fileId || mixdropUpload?.fileId || null,
                  tags: [recording.platform, 'webcam', 'recording']
                });
                
                await video.save();
                
                // Link recording to video
                recording.videoId = video._id as any;
                logger.info(`Created video entry: ${video._id} for recording ${recording._id}`);
              } else {
                recording.uploadStatus = 'failed';
                recording.error = 'Failed to upload to any hosting service';
              }
            } else {
              recording.uploadStatus = 'failed';
              recording.error = 'No upload results received';
            }
            
            await recording.save();
            
            // Delete file after upload
            fs.unlinkSync(recording.filePath);
          } catch (error) {
            logger.error('Error uploading pending file:', error);
            recording.uploadStatus = 'failed';
            recording.error = `Upload error: ${error instanceof Error ? error.message : String(error)}`;
            await recording.save();
          }
        } else {
          recording.uploadStatus = 'failed';
          recording.error = 'File not found';
          await recording.save();
        }
      }
    } catch (error) {
      logger.error('Error checking pending uploads:', error);
    }
  }

  async checkLiveStreams(): Promise<void> {
    try {
      // Check currently active recordings
      const activeRecordingIds = Array.from(RecordingService.activeRecordings.keys());
      
      for (const recordingId of activeRecordingIds) {
        const recordingInfo = RecordingService.activeRecordings.get(recordingId);
        if (recordingInfo) {
          const streamUrl = await RecordingService.streamDetector.detectStream(recordingInfo.recording.streamUrl);
          if (!streamUrl) {
            await RecordingService.stopRecording(recordingId);
          }
        }
      }
    } catch (error) {
      logger.error('Error checking live streams:', error);
    }
  }
}

export default RecordingService;
export { RecordingService }; 