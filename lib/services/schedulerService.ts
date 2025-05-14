import { CronJob } from 'cron';
import RecordingConfig from '../models/RecordingConfig';
import RecordingService from './RecordingService';
import { logger } from '../utils/logger';

class SchedulerService {
  private static instance: SchedulerService;
  private recordingService: RecordingService;
  private isActive: boolean = false;
  private checkInterval: number = 5 * 60 * 1000; // 5 minutes
  private uploadInterval: number = 60 * 60 * 1000; // 1 hour
  private lastRunTimestamps: { [key: string]: Date } = {};
  private activeRecordings: Set<string> = new Set();
  private jobs: Map<string, CronJob> = new Map();

  private constructor() {
    this.recordingService = new RecordingService();
  }

  public static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
    }
    return SchedulerService.instance;
  }

  public async start(options?: { checkInterval?: number; uploadInterval?: number }): Promise<void> {
    if (this.isActive) return;
    
    if (options?.checkInterval) {
      this.checkInterval = options.checkInterval;
    }
    
    this.isActive = true;
    await this.initialize();
    logger.info('Scheduler service started with check interval:', this.checkInterval);
  }

  public async stop(): Promise<void> {
    if (!this.isActive) return;
    this.isActive = false;
    await this.cleanup();
    logger.info('Scheduler service stopped');
  }

  public isRunning(): boolean {
    return this.isActive;
  }

  public getCheckInterval(): number {
    return this.checkInterval;
  }

  public getUploadInterval(): number {
    return this.uploadInterval;
  }

  public getActiveRecordingCount(): number {
    return this.activeRecordings.size;
  }

  public getActiveRecordings(): string[] {
    return Array.from(this.activeRecordings);
  }

  public getLastRunTimestamps(): { [key: string]: Date } {
    return { ...this.lastRunTimestamps };
  }

  public getTasks(): string[] {
    return Array.from(this.jobs.keys());
  }

  public async checkStreams(): Promise<void> {
    if (!this.isActive) return;
    this.lastRunTimestamps['checkStreams'] = new Date();
    await this.recordingService.checkActiveStreams();
  }

  public async checkPendingUploads(): Promise<void> {
    if (!this.isActive) return;
    this.lastRunTimestamps['checkUploads'] = new Date();
    await this.recordingService.checkPendingUploads();
  }

  public async checkLiveStreams(): Promise<void> {
    if (!this.isActive) return;
    this.lastRunTimestamps['checkLiveStreams'] = new Date();
    await this.recordingService.checkLiveStreams();
  }

  async initialize() {
    // Load all active configurations
    const configs = await RecordingConfig.find({ isActive: true });
    
    // Schedule jobs for each configuration
    for (const config of configs) {
      this.scheduleRecording(config);
    }
  }

  scheduleRecording(config: any) {
    // Create a cron job that runs every minute to check if recording should start
    const job = new CronJob('* * * * *', async () => {
      if (this.shouldStartRecording(config)) {
        await RecordingService.startRecording(config);
      }
    });

    job.start();
    this.jobs.set(config._id.toString(), job);
  }

  private shouldStartRecording(config: any): boolean {
    const now = new Date();
    const dayOfWeek = now.getDay();

    // Check if today is in the schedule
    if (config.schedule.daysOfWeek && !config.schedule.daysOfWeek.includes(dayOfWeek)) {
      return false;
    }

    // Check if current time is within the scheduled time range
    if (config.schedule.startTime && config.schedule.endTime) {
      const [startHour, startMinute] = config.schedule.startTime.split(':').map(Number);
      const [endHour, endMinute] = config.schedule.endTime.split(':').map(Number);

      const startTime = new Date();
      startTime.setHours(startHour, startMinute, 0, 0);

      const endTime = new Date();
      endTime.setHours(endHour, endMinute, 0, 0);

      if (now < startTime || now > endTime) {
        return false;
      }
    }

    return true;
  }

  async updateSchedule(configId: string) {
    // Stop existing job if any
    const existingJob = this.jobs.get(configId);
    if (existingJob) {
      existingJob.stop();
      this.jobs.delete(configId);
    }

    // Get updated configuration
    const config = await RecordingConfig.findById(configId);
    if (config && config.isActive) {
      this.scheduleRecording(config);
    }
  }

  async stopSchedule(configId: string) {
    const job = this.jobs.get(configId);
    if (job) {
      job.stop();
      this.jobs.delete(configId);
    }
  }

  async cleanup() {
    // Stop all jobs
    for (const job of this.jobs.values()) {
      job.stop();
    }
    this.jobs.clear();
  }
}

const schedulerService = SchedulerService.getInstance();
export default schedulerService; 