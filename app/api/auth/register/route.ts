import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User, { IUser } from '@/lib/models/User';

export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectDB();
    
    // Parse request body
    const body = await request.json();
    const { username, email, password } = body;
    
    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Additional validation (optional)
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }
    
    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${username}$`, 'i') } },
        { email: { $regex: new RegExp(`^${email}$`, 'i') } }
      ]
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 400 }
      );
    }
    
    // Create new user - don't hash password here, the model's pre-save hook will do it
    const newUser = new User({
      username,
      email: email.toLowerCase(),
      password, // The Schema's pre-save hook will hash this
      isAdmin: false,
      isPremium: false,
      avatar: `/images/default-avatar.svg`,
      providers: [{
        provider: 'credentials',
        providerId: email.toLowerCase()
      }]
    });
    
    // Log before saving
    console.log('Creating new user:', { username, email, passwordLength: password.length });
    
    // Save user to database
    await newUser.save();
    
    // Log after saving
    console.log('User created successfully with ID:', newUser._id);
    
    // Return success without sensitive information
    return NextResponse.json({
      success: true,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        isAdmin: newUser.isAdmin
      }
    });
    
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: Object.values(error.errors).map((err: any) => err.message).join(', ') },
        { status: 400 }
      );
    }
    
    // Handle other errors
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
} 