import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB, { isInMockMode } from '@/lib/db';
import User from '@/lib/models/User';
import { authOptions } from '@/lib/auth';
import { Document } from 'mongoose';
import { getAllUsers, createInitialAdminUser } from '@/lib/utils/data-transition';

// Interface to properly type MongoDB documents
interface MongoDBUser extends Document {
  _id: any;
  username?: string;
  email?: string;
  avatar?: string;
  isAdmin?: boolean;
  isPremium?: boolean;
  createdAt?: Date;
}

// Interface for user that could be either from DB or mock
interface AnyUser {
  _id?: any;
  id?: string;
  username?: string;
  name?: string;
  email: string;
  avatar?: string | null;
  isAdmin: boolean;
  isPremium: boolean;
  createdAt: string | Date;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Try to connect to DB
    await connectDB();
    
    // Get users with our transition utility (tries real DB first, falls back to mock if needed)
    const users = await getAllUsers(50) as AnyUser[];
    
    // Format the user data for the response
    const formattedUsers = users.map(user => ({
      id: String(user._id || user.id),
      username: user.username || user.name || 'User',
      email: user.email,
      status: user.isAdmin ? 'admin' : user.isPremium ? 'premium' : 'active',
      isAdmin: user.isAdmin,
      isPremium: user.isPremium,
      createdAt: user.createdAt
    }));
    
    // If we're transitioning from mock to real DB, ensure admin user exists
    if (!isInMockMode()) {
      // This will check if admin exists in real DB and create if needed
      await createInitialAdminUser();
    }
    
    return NextResponse.json(formattedUsers);
    
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.username || !data.email) {
      return NextResponse.json(
        { error: 'Username and email are required' }, 
        { status: 400 }
      );
    }
    
    // Connect to database - this is required for real DB operations
    await connectDB();
    
    // If in mock mode, just return a success message without creating
    if (isInMockMode()) {
      console.log('Note: User creation attempted in mock mode - operation simulated');
      return NextResponse.json({
        id: 'mock-user-' + Date.now(),
        username: data.username,
        email: data.email,
        status: data.isAdmin ? 'admin' : data.isPremium ? 'premium' : 'active',
        isAdmin: !!data.isAdmin,
        isPremium: !!data.isPremium,
        createdAt: new Date().toISOString()
      }, { status: 201 });
    }
    
    // This is real database mode, proceed with checking for existing user and creating
    
    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [
        { username: data.username },
        { email: data.email }
      ]
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 400 }
      );
    }
    
    // Create new user
    const newUser = new User({
      username: data.username,
      email: data.email.toLowerCase(),
      password: data.password,
      isAdmin: !!data.isAdmin,
      isPremium: !!data.isPremium,
      avatar: data.avatar || '/images/default-avatar.png'
    }) as MongoDBUser;
    
    await newUser.save();
    
    return NextResponse.json({
      id: String(newUser._id),
      username: newUser.username,
      email: newUser.email,
      status: newUser.isAdmin ? 'admin' : newUser.isPremium ? 'premium' : 'active',
      isAdmin: newUser.isAdmin,
      isPremium: newUser.isPremium,
      createdAt: newUser.createdAt
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 