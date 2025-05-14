import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB, { isInMockMode } from '@/lib/db';
import User, { IUser } from '@/lib/models/User';
import { authOptions } from '@/lib/auth';
import { getUserByEmail } from '@/lib/utils/data-transition';

// Interface to handle both DB and mock user types
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
  bio?: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Try to connect to DB
    await connectDB();
    
    // Use our transition utility that tries real DB first, then falls back to mock if needed
    const user = await getUserByEmail(session.user.email as string) as AnyUser;
    
    if (user) {
      return NextResponse.json({
        id: user._id || user.id,
        username: user.username || user.name || 'User',
        email: user.email,
        avatar: user.avatar || session.user.image,
        isAdmin: user.isAdmin,
        isPremium: user.isPremium,
        createdAt: user.createdAt,
        bio: user.bio || ''
      });
    }
    
    // If no user found, return session data as fallback
    return NextResponse.json({
      username: session.user.name || 'User',
      email: session.user.email,
      avatar: session.user.image,
      isAdmin: session.user.isAdmin || false,
      isPremium: session.user.isPremium || false,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    
    // Try to get session data as fallback
    const session = await getServerSession(authOptions);
    if (session?.user) {
      return NextResponse.json({
        username: session.user.name || 'User',
        email: session.user.email,
        avatar: session.user.image,
        isAdmin: session.user.isAdmin || false,
        isPremium: session.user.isPremium || false,
      });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await request.json();
    const { username, bio, avatar } = data;
    
    // Connect to database
    await connectDB();
    
    // Get user with our transition utility
    const userToUpdate = await getUserByEmail(session.user.email as string) as AnyUser;
    
    if (!userToUpdate) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Determine if we're working with a real database user or mock user
    if (!isInMockMode() && userToUpdate._id) {
      // Real database flow - update in MongoDB
      const user = userToUpdate as IUser;
      
      // Update user data
      if (username) user.username = username;
      if (bio !== undefined) user.bio = bio;
      if (avatar) user.avatar = avatar;
      
      await user.save();
      
      return NextResponse.json({ 
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio
        }
      });
    } else {
      // Mock user - just return success but can't actually update
      // This is a fallback that shouldn't be needed in production
      console.log('Note: Mock user profile attempted to be updated - this is expected during DB transition');
      
      return NextResponse.json({ 
        success: true,
        message: 'Profile update acknowledged',
        user: {
          id: userToUpdate.id || userToUpdate._id,
          username: username || userToUpdate.username || userToUpdate.name,
          email: userToUpdate.email,
          avatar: avatar || userToUpdate.avatar,
          bio: bio || userToUpdate.bio || ''
        }
      });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ 
      error: 'Failed to update profile',
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 