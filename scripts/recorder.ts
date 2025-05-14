#!/usr/bin/env node

import { RecorderEngine } from '../lib/services/RecorderEngine';
import { StreamDetectorService } from '../lib/services/StreamDetectorService';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Command } from 'commander';

// Load environment variables
dotenv.config();

// Initialize MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/webcamrips')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Initialize services
const streamDetector = new StreamDetectorService();
const recorder = new RecorderEngine(streamDetector);

// CLI program setup
const program = new Command();

program
  .name('recorder')
  .description('WebcamRips stream recorder CLI')
  .version('1.0.0');

program
  .command('record')
  .description('Record a stream from a URL')
  .argument('<url>', 'URL of the stream to record')
  .action(async (url: string) => {
    try {
      await recorder.initialize();
      console.log('Starting recording...');
      
      const video = await recorder.detectAndRecord(url);
      if (video) {
        console.log('Recording completed successfully!');
        console.log('Video saved:', video.gofilesUrl);
      } else {
        console.log('No stream detected or recording failed');
      }
    } catch (error) {
      console.error('Error during recording:', error);
    } finally {
      await recorder.cleanup();
      await mongoose.disconnect();
    }
  });

program
  .command('monitor')
  .description('Monitor multiple URLs for streams')
  .argument('<urls...>', 'URLs to monitor')
  .option('-i, --interval <seconds>', 'Check interval in seconds', '60')
  .action(async (urls: string[], options: { interval: string }) => {
    try {
      await recorder.initialize();
      console.log('Starting stream monitoring...');
      
      const interval = parseInt(options.interval) * 1000;
      
      while (true) {
        for (const url of urls) {
          console.log(`Checking ${url}...`);
          const video = await recorder.detectAndRecord(url);
          if (video) {
            console.log('New recording started:', video.gofilesUrl);
          }
        }
        
        console.log(`Waiting ${options.interval} seconds before next check...`);
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    } catch (error) {
      console.error('Error during monitoring:', error);
    } finally {
      await recorder.cleanup();
      await mongoose.disconnect();
    }
  });

program.parse(); 