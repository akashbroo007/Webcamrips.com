import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/utils/db';
import ExternalVideo from '@/lib/models/ExternalVideo';
import { apiLogger } from '@/lib/utils/logger';

interface Params {
  params: {
    id: string;
  };
}

// GET handler to fetch single external video
export async function GET(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const incrementView = searchParams.get('increment') === 'true';
    
    // Find the video first
    const video = await ExternalVideo.findById(id);
    
    if (!video || !video.isActive) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }
    
    // Increment view if specified
    if (incrementView) {
      await video.incrementViews();
    }
    
    return NextResponse.json(video);
  } catch (error) {
    apiLogger.error(`Error fetching external video ID ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch external video' },
      { status: 500 }
    );
  }
} 