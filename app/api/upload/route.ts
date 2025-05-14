import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/db';
import Video from '@/lib/models/Video';
import fileHostService from '@/lib/services/FileHostService';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/x-matroska', 'video/avi', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported formats: MP4, MKV, AVI, WEBM' },
        { status: 400 }
      );
    }

    // Validate file size (5GB max)
    const maxSize = 5 * 1024 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds maximum limit of 5GB' },
        { status: 400 }
      );
    }

    // Save file to temporary directory
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempDir = path.join(process.cwd(), 'temp');
    const filename = `${Date.now()}_${file.name}`;
    const filepath = path.join(tempDir, filename);

    await writeFile(filepath, buffer);

    // Upload to file hosting services
    const uploadResults = await fileHostService.uploadToMultipleHosts(filepath);

    // Check if any upload was successful
    const successfulUpload = uploadResults.find(result => result.success);
    if (!successfulUpload) {
      return NextResponse.json(
        { error: 'Failed to upload to any hosting service' },
        { status: 500 }
      );
    }

    // Save video metadata to database
    await connectDB();
    const video = new Video({
      title: file.name,
      gofilesUrl: successfulUpload.url,
      uploadDate: new Date(),
      duration: '2:00',
      views: 0
    });

    await video.save();

    // Clean up temporary file
    await writeFile(filepath, '');

    return NextResponse.json({
      success: true,
      video: {
        id: video._id,
        title: video.title,
        url: successfulUpload.url
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 