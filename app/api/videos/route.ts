import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Video, Performer } from '@/lib/models';

// Force Mongoose to register the Performer model early
import '@/lib/models/Performer';

// Preload all models to avoid MissingSchemaError
import '@/lib/models/preload-models';

// Configuration for this route using the newer export syntax
export const dynamic = 'force-dynamic'; // Default is auto
export const revalidate = 60; // revalidate at most once per minute
export const runtime = 'nodejs'; // Default is edge

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const data = await request.json();
    const { title, description, gofilesUrl, thumbnailUrl, platform = 'Unknown' } = data;

    // Validate required fields
    if (!title || !gofilesUrl) {
      return NextResponse.json(
        { error: 'Title and gofilesUrl are required' },
        { status: 400 }
      );
    }

    // Create new video
    const video = new Video({
      title,
      description,
      gofilesUrl,
      thumbnail: thumbnailUrl,
      duration: data.duration || 0,
      views: 0,
      platform
    });

    await video.save();

    return NextResponse.json({ success: true, video });
  } catch (error) {
    console.error('Error saving video:', error);
    return NextResponse.json(
      { error: 'Failed to save video' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50); // Cap at 50 to prevent large responses
    const platform = searchParams.get('platform');
    const sortBy = searchParams.get('sort') || 'newest';
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (platform && platform !== 'all') {
      query.platform = platform;
    }

    // Build sort options
    let sortOptions: any = { createdAt: -1 }; // Default to newest
    if (sortBy === 'oldest') sortOptions = { createdAt: 1 };
    if (sortBy === 'views') sortOptions = { views: -1 };
    if (sortBy === 'duration') sortOptions = { duration: -1 };

    // Use projection to limit the fields returned for each video
    // This significantly reduces the response size
    const videos = await Video.find(query, {
      _id: 1,
      title: 1,
      thumbnail: 1,
      duration: 1,
      views: 1,
      platform: 1,
      createdAt: 1,
      performer: 1,
      gofilesUrl: 1,
      mixdropUrl: 1,
    })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('performer', 'name')
      .lean(); // Use lean() for faster queries and smaller results

    const total = await Video.countDocuments(query);

    // Set caching headers to improve performance
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    
    return NextResponse.json({
      videos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, {
      headers,
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
} 