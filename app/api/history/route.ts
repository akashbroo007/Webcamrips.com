import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/utils/db';
import { authOptions } from '@/lib/auth';
import RecentlyViewed from '@/lib/models/RecentlyViewed';
import Video from '@/lib/models/Video';
import { apiLogger } from '@/lib/utils/logger';
import mongoose from 'mongoose';

// GET handler to retrieve user's recently viewed videos
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
    
    // Find the user's recently viewed history, or create an empty one
    let recentlyViewed = await RecentlyViewed.findOne({ userId: session.user.id })
      .populate('videoIds', 'title thumbnail duration platform performerId views createdAt fileUrl');
      
    if (!recentlyViewed) {
      // Return empty array if no history found
      return NextResponse.json({ history: { videoIds: [] } });
    }
    
    return NextResponse.json({ history: recentlyViewed });
  } catch (error) {
    apiLogger.error('Error fetching recently viewed history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recently viewed history' },
      { status: 500 }
    );
  }
}

// POST handler to add a video to the history
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
    
    // Verify the video exists
    const videoExists = await Video.exists({ _id: videoId });
    if (!videoExists) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }
    
    // Find the user's history or create a new one
    let recentlyViewed = await RecentlyViewed.findOne({ userId: session.user.id });
    
    if (!recentlyViewed) {
      recentlyViewed = new RecentlyViewed({
        userId: session.user.id,
        videoIds: [videoId],
      });
    } else {
      // Check if video is already in the history and remove it if present
      const videoIds = recentlyViewed.videoIds as any[];
      recentlyViewed.videoIds = videoIds.filter(
        id => id.toString() !== videoId.toString()
      ) as any;
      
      // Add the video to the beginning of the array (most recent)
      (recentlyViewed.videoIds as any).unshift(videoId);
    }
    
    await recentlyViewed.save();
    
    return NextResponse.json(
      { message: 'Video added to history' },
      { status: 200 }
    );
  } catch (error) {
    apiLogger.error('Error adding to history:', error);
    return NextResponse.json(
      { error: 'Failed to add video to history' },
      { status: 500 }
    );
  }
}

// DELETE handler to clear history
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
    const action = searchParams.get('action');
    const videoId = searchParams.get('videoId');
    
    await connectDB();
    
    if (action === 'clear') {
      // Clear entire history
      await RecentlyViewed.findOneAndUpdate(
        { userId: session.user.id },
        { videoIds: [] }
      );
      
      return NextResponse.json(
        { message: 'History cleared' },
        { status: 200 }
      );
    } else if (videoId) {
      // Remove specific video from history
      await RecentlyViewed.findOneAndUpdate(
        { userId: session.user.id },
        { $pull: { videoIds: videoId } }
      );
      
      return NextResponse.json(
        { message: 'Video removed from history' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use action=clear or provide videoId' },
        { status: 400 }
      );
    }
  } catch (error) {
    apiLogger.error('Error modifying history:', error);
    return NextResponse.json(
      { error: 'Failed to modify history' },
      { status: 500 }
    );
  }
} 