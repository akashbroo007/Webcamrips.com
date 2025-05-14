import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const revalidate = 10; // Revalidate every 10 seconds

export async function GET() {
  try {
    await connectDB();
    
    // Check if the connection is ready
    const isConnected = mongoose.connection.readyState === 1;
    
    if (isConnected) {
      return NextResponse.json({
        connected: true,
        status: 'Connected to MongoDB',
        readyState: mongoose.connection.readyState,
      });
    } else {
      return NextResponse.json({
        connected: false,
        status: 'Not connected to MongoDB',
        readyState: mongoose.connection.readyState,
        message: 'Database connection not established'
      }, { status: 503 });
    }
  } catch (error) {
    console.error('Error checking MongoDB status:', error);
    
    return NextResponse.json({
      connected: false,
      status: 'Error connecting to MongoDB',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 