import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Get all cookies
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    
    // Get user info for logging purpose (may be null if not authenticated)
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email || 'anonymous';
    
    // Create response to clear all cookies
    const response = NextResponse.json({ 
      success: true, 
      message: 'Session cleared successfully',
      user: userEmail,
      cookiesCleared: allCookies.length
    });
    
    // Clear all cookies, not just auth-related ones
    for (const cookie of allCookies) {
      response.cookies.delete(cookie.name);
    }
    
    // Additional known cookies that might be causing issues
    const cookiesToClear = [
      'next-auth.session-token',
      'next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.csrf-token',
      '__Secure-next-auth.callback-url',
      'AWSALB',
      'AWSALBCORS'
    ];
    
    cookiesToClear.forEach(name => {
      response.cookies.delete(name);
    });
    
    // Set cache control headers
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"');
    
    return response;
  } catch (error) {
    console.error('Error clearing sessions:', error);
    return NextResponse.json({ error: 'Failed to clear sessions' }, { status: 500 });
  }
}

// Allow this endpoint to be called even when not logged in
export const dynamic = 'force-dynamic'; 