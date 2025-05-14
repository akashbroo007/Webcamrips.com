import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Recording from '@/lib/models/Recording';

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to database
    await connectDB();
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');
    
    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (platform) query.platform = platform;
    
    // Fetch recordings
    const recordings = await Recording.find(query)
      .sort({ startTime: -1 })
      .limit(50);
    
    return NextResponse.json(recordings);
  } catch (error) {
    console.error('Error fetching recordings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recordings' },
      { status: 500 }
    );
  }
}

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
    
    // Create new recording
    const recording = new Recording(body);
    await recording.save();
    
    return NextResponse.json(recording);
  } catch (error) {
    console.error('Error creating recording:', error);
    return NextResponse.json(
      { error: 'Failed to create recording' },
      { status: 500 }
    );
  }
} 