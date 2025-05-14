import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/utils/db';
import { authOptions } from '@/lib/auth';
import ExternalVideo from '@/lib/models/ExternalVideo';
import { apiLogger } from '@/lib/utils/logger';

// GET handler to fetch external videos
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const sourceType = searchParams.get('sourceType');
    const query = searchParams.get('query');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter: any = { isActive: true };
    if (platform) filter.platform = platform;
    if (sourceType) filter.sourceType = sourceType;
    if (query) {
      filter.$text = { $search: query };
    }
    
    // Get videos with pagination
    const videos = await ExternalVideo.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await ExternalVideo.countDocuments(filter);
    
    return NextResponse.json({
      videos,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    apiLogger.error('Error fetching external videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch external videos' },
      { status: 500 }
    );
  }
}

// POST handler to add a new external video
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has permission
    if (!session?.user?.id || session?.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'sourceUrl', 'embedUrl', 'thumbnailUrl', 'sourceType', 'platform'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Create new external video
    const externalVideo = new ExternalVideo({
      ...data,
      views: 0,
      isActive: true
    });
    
    await externalVideo.save();
    
    return NextResponse.json(
      { message: 'External video added successfully', video: externalVideo },
      { status: 201 }
    );
  } catch (error) {
    apiLogger.error('Error adding external video:', error);
    return NextResponse.json(
      { error: 'Failed to add external video' },
      { status: 500 }
    );
  }
}

// PATCH handler to update an external video
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has permission
    if (!session?.user?.id || session?.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const data = await request.json();
    const { id, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }
    
    // Update video
    const updatedVideo = await ExternalVideo.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!updatedVideo) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'External video updated successfully',
      video: updatedVideo
    });
  } catch (error) {
    apiLogger.error('Error updating external video:', error);
    return NextResponse.json(
      { error: 'Failed to update external video' },
      { status: 500 }
    );
  }
}

// DELETE handler to remove an external video
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has permission
    if (!session?.user?.id || session?.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Instead of deleting, mark as inactive
    const result = await ExternalVideo.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!result) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'External video removed successfully'
    });
  } catch (error) {
    apiLogger.error('Error removing external video:', error);
    return NextResponse.json(
      { error: 'Failed to remove external video' },
      { status: 500 }
    );
  }
} 