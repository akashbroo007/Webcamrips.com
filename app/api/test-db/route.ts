import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/utils/database';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await dbConnect();
    
    // Check connection status
    const isConnected = mongoose.connection.readyState === 1;
    
    return NextResponse.json({
      status: 'success',
      connected: isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message,
      code: error.code,
      name: error.name
    }, { status: 500 });
  }
} 