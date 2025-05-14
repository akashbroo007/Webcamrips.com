import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Video from '@/lib/models/Video';

export async function GET(request: Request) {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Fetch videos with pagination
    const videos = await Video.find()
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Video.countDocuments();

    return NextResponse.json({
      videos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
} 