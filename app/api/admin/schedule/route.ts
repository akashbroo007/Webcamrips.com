import { NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import dbConnect from '@/lib/utils/database';
import scheduler from '@/lib/services/schedulerService';

// GET /api/admin/schedule - Get scheduler status
export async function GET() {
  try {
    await dbConnect();
    
    const isRunning = scheduler.isRunning();
    const status = {
      isRunning,
      tasks: scheduler.getTasks(),
      lastRunTimestamps: scheduler.getLastRunTimestamps(),
      activeRecordings: scheduler.getActiveRecordingCount(),
      checkInterval: scheduler.getCheckInterval(),
    };
    
    return NextResponse.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Error getting scheduler status:', error);
    return NextResponse.json(
      { error: 'Failed to get scheduler status', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/admin/schedule - Start/stop scheduler or run task immediately
export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const action = body.action;
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }
    
    switch (action) {
      case 'start':
        if (scheduler.isRunning()) {
          return NextResponse.json({
            success: false,
            message: 'Scheduler is already running'
          });
        }
        
        const opts = body.options || {};
        scheduler.start({
          checkInterval: opts.checkInterval,
          uploadInterval: opts.uploadInterval
        });
        
        return NextResponse.json({
          success: true,
          message: 'Scheduler started successfully',
          isRunning: true
        });
        
      case 'stop':
        if (!scheduler.isRunning()) {
          return NextResponse.json({
            success: false,
            message: 'Scheduler is not running'
          });
        }
        
        scheduler.stop();
        return NextResponse.json({
          success: true,
          message: 'Scheduler stopped successfully',
          isRunning: false
        });
        
      case 'checkStreams':
        // Run the stream check task immediately
        const streamResults = await scheduler.checkLiveStreams();
        return NextResponse.json({
          success: true,
          message: 'Stream check completed',
          results: streamResults
        });
        
      case 'handleUploads':
        // Run the upload task immediately
        const uploadResults = await scheduler.checkPendingUploads();
        return NextResponse.json({
          success: true,
          message: 'Upload handling completed',
          results: uploadResults
        });
        
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Error managing scheduler:', error);
    return NextResponse.json(
      { error: 'Failed to manage scheduler', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/schedule - Update scheduler settings
export async function PATCH(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { checkInterval, uploadInterval } = body;
    
    if (!checkInterval && !uploadInterval) {
      return NextResponse.json(
        { error: 'At least one setting (checkInterval or uploadInterval) must be provided' },
        { status: 400 }
      );
    }
    
    const wasRunning = scheduler.isRunning();
    if (wasRunning) {
      scheduler.stop();
    }
    
    const settings: { [key: string]: any } = {};
    if (checkInterval) settings.checkInterval = checkInterval;
    if (uploadInterval) settings.uploadInterval = uploadInterval;
    
    // Apply the settings
    Object.entries(settings).forEach(([key, value]) => {
      (scheduler as any)[key] = value;
    });
    
    // Restart if it was running
    if (wasRunning) {
      scheduler.start();
    }
    
    return NextResponse.json({
      success: true,
      message: 'Scheduler settings updated',
      settings: {
        checkInterval: scheduler.getCheckInterval(),
        uploadInterval: scheduler.getUploadInterval(),
        isRunning: scheduler.isRunning()
      }
    });
  } catch (error) {
    logger.error('Error updating scheduler settings:', error);
    return NextResponse.json(
      { error: 'Failed to update scheduler settings', details: (error as Error).message },
      { status: 500 }
    );
  }
} 