import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import RecordingService from '@/lib/services/RecordingService';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to database
    await connectDB();
    
    // Get request body
    const body = await request.json();
    const { streamUrl, modelName, platform, quality, duration } = body;
    
    // Validate required fields
    if (!streamUrl || !modelName || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields: streamUrl, modelName, and platform are required' },
        { status: 400 }
      );
    }
    
    // Start recording using RecordingService
    const recordingOptions = {
      streamUrl,
      modelName,
      platform,
      quality: quality || 'best',
      maxDuration: duration || (60 * 60 * 2) // 2 hours default
    };
    
    // Start the recording process
    const recordingProcess = await RecordingService.startRecording(recordingOptions);
    
    if (!recordingProcess || !recordingProcess.id) {
      return NextResponse.json(
        { error: 'Failed to start recording' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Recording started successfully',
      recordingId: recordingProcess.id
    });
    
  } catch (error) {
    console.error('Error starting recording:', error);
    return NextResponse.json(
      { error: 'Failed to start recording' },
      { status: 500 }
    );
  }
} 