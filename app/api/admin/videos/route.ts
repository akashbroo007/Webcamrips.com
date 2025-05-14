import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/db';
import { Video } from '@/lib/models';
import { authOptions } from '@/lib/auth';

// Preload all models to avoid MissingSchemaError
import '@/lib/models/preload-models';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    // Get all videos, sort by creation date in descending order (newest first)
    const videos = await Video.find({ verified: false })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('performer', 'name');
    
    // Format the video data for the response
    const formattedVideos = videos.map(video => {
      // Use a type assertion to any to bypass TypeScript checks
      const v = video as any;
      return {
        id: String(v._id),
        title: v.title,
        uploader: v.uploader || 'System',
        platform: v.platform || 'Unknown',
        performer: v.performer?.name || 'Unknown',
        duration: v.duration || 0,
        isPrivate: v.isPrivate || false,
        verified: v.verified || false,
        createdAt: v.createdAt
      };
    });
    
    return NextResponse.json(formattedVideos);
    
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.gofilesUrl) {
      return NextResponse.json(
        { error: 'Title and video URL are required' }, 
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Create new video
    const newVideo = new Video({
      title: data.title,
      description: data.description || '',
      gofilesUrl: data.gofilesUrl,
      mixdropUrl: data.mixdropUrl || '',
      thumbnail: data.thumbnailUrl || '',
      duration: data.duration || 0,
      performer: data.performer || null,
      platform: data.platform || 'Unknown',
      uploader: data.uploader || session.user.id,
      isPrivate: !!data.isPrivate,
      verified: !!data.verified
    });
    
    await newVideo.save();
    
    // Use a type assertion to any to bypass TypeScript checks
    const v = newVideo as any;
    
    return NextResponse.json({
      id: String(v._id),
      title: v.title,
      description: v.description,
      gofilesUrl: v.gofilesUrl,
      mixdropUrl: v.mixdropUrl,
      thumbnailUrl: v.thumbnail,
      duration: v.duration,
      performer: v.performer,
      platform: v.platform,
      uploader: v.uploader,
      isPrivate: v.isPrivate,
      verified: v.verified,
      createdAt: v.createdAt
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 