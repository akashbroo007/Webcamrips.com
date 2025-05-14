import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/utils/db';
import { authOptions } from '@/lib/auth';
import WatchLater, { IWatchLater } from '@/lib/models/WatchLater';
import { apiLogger } from '@/lib/utils/logger';
import mongoose from 'mongoose';

// GET handler to retrieve user's watch later queue
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    // Find the user's watch later queue, or create an empty one
    let watchLater = await WatchLater.findOne({ userId: session.user.id })
      .populate('videoIds', 'title thumbnail duration platform performerId views createdAt');
      
    if (!watchLater) {
      // Return empty array if no watch later found
      return NextResponse.json({ watchLater: { videoIds: [] } });
    }
    
    return NextResponse.json({ watchLater });
  } catch (error) {
    apiLogger.error('Error fetching watch later queue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch watch later queue' },
      { status: 500 }
    );
  }
}

// POST handler to add a video to the queue
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { videoId } = await request.json();
    
    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Find the user's watch later queue or create a new one
    let watchLater = await WatchLater.findOne({ userId: session.user.id });
    
    if (!watchLater) {
      watchLater = new WatchLater({
        userId: session.user.id,
        videoIds: [videoId],
      });
    } else {
      // Check if video is already in the queue
      const hasVideo = watchLater.videoIds.some(id => id.toString() === videoId.toString());
      if (hasVideo) {
        return NextResponse.json(
          { message: 'Video already in watch later queue' },
          { status: 200 }
        );
      }
      
      // Add the video to the queue
      // Cast videoIds to any to bypass type checking, then push
      (watchLater.videoIds as any).push(videoId);
    }
    
    await watchLater.save();
    
    return NextResponse.json(
      { message: 'Video added to watch later queue' },
      { status: 200 }
    );
  } catch (error) {
    apiLogger.error('Error adding to watch later queue:', error);
    return NextResponse.json(
      { error: 'Failed to add video to watch later queue' },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a video from the queue
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    
    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Find the user's watch later queue
    const watchLater = await WatchLater.findOne({ userId: session.user.id });
    
    if (!watchLater) {
      return NextResponse.json(
        { error: 'Watch later queue not found' },
        { status: 404 }
      );
    }
    
    // Remove the video from the queue
    watchLater.videoIds = watchLater.videoIds.filter(
      id => id.toString() !== videoId
    ) as mongoose.Types.ObjectId[];
    
    await watchLater.save();
    
    return NextResponse.json(
      { message: 'Video removed from watch later queue' },
      { status: 200 }
    );
  } catch (error) {
    apiLogger.error('Error removing from watch later queue:', error);
    return NextResponse.json(
      { error: 'Failed to remove video from watch later queue' },
      { status: 500 }
    );
  }
} 