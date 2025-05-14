import { NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import Performer from '@/lib/models/Performer';
import dbConnect from '@/lib/utils/database';

// GET /api/admin/performers - Get all performers
export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const isActiveParam = searchParams.get('isActive');
    const platformParam = searchParams.get('platform');
    
    // Build query based on parameters
    const query: any = {};
    
    if (isActiveParam !== null) {
      query.isActive = isActiveParam === 'true';
    }
    
    if (platformParam) {
      query['platforms.platform'] = platformParam;
    }
    
    const performers = await Performer.find(query).sort({ name: 1 });
    
    return NextResponse.json({
      success: true,
      count: performers.length,
      data: performers
    });
  } catch (error) {
    logger.error('Error fetching performers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performers', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/admin/performers - Create a new performer
export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.platforms || !Array.isArray(body.platforms) || body.platforms.length === 0) {
      return NextResponse.json(
        { error: 'Name and at least one platform are required' },
        { status: 400 }
      );
    }
    
    // Validate each platform
    for (const platform of body.platforms) {
      if (!platform.platform || !platform.channelId || !platform.url) {
        return NextResponse.json(
          { error: 'Each platform must include platform name, channelId, and URL' },
          { status: 400 }
        );
      }
    }
    
    // Check if performer already exists
    const existingPerformer = await Performer.findOne({ name: body.name });
    if (existingPerformer) {
      return NextResponse.json(
        { error: 'Performer with this name already exists' },
        { status: 409 }
      );
    }
    
    // Create the new performer
    const performer = await Performer.create(body);
    
    logger.info(`Created new performer: ${performer.name}`);
    
    return NextResponse.json({
      success: true,
      data: performer
    }, { status: 201 });
  } catch (error) {
    logger.error('Error creating performer:', error);
    return NextResponse.json(
      { error: 'Failed to create performer', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/performers - Update multiple performers status
export async function PATCH(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        { error: 'Performer IDs are required' },
        { status: 400 }
      );
    }
    
    if (body.isActive === undefined) {
      return NextResponse.json(
        { error: 'isActive status is required' },
        { status: 400 }
      );
    }
    
    // Update performers
    const result = await Performer.updateMany(
      { _id: { $in: body.ids } },
      { isActive: Boolean(body.isActive) }
    );
    
    logger.info(`Updated ${result.modifiedCount} performers' active status to ${body.isActive}`);
    
    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    logger.error('Error updating performers:', error);
    return NextResponse.json(
      { error: 'Failed to update performers', details: (error as Error).message },
      { status: 500 }
    );
  }
} 