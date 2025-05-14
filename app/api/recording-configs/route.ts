import { NextResponse } from 'next/server';
import RecordingConfig from '@/lib/models/RecordingConfig';
import RecordingService from '@/lib/services/RecordingService';

const recordingService = new RecordingService();

export async function GET() {
  try {
    const configs = await RecordingConfig.find({});
    return NextResponse.json(configs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recording configs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const config = new RecordingConfig(body);
    await config.save();
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create recording config' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updateData } = await request.json();
    const config = await RecordingConfig.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update recording config' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await RecordingConfig.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Recording config deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete recording config' }, { status: 500 });
  }
} 