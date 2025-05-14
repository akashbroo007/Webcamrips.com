import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Attempt to get the session
    const session = await getServerSession(authOptions);
    
    // Redirect to home, whether there's a session or not
    return NextResponse.redirect(new URL('/', process.env.NEXTAUTH_URL));
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.redirect(new URL('/', process.env.NEXTAUTH_URL));
  }
} 