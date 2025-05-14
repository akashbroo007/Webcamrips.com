import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";

// We don't need to use the authOptions for this route, since we're only concerned with clearing cookies

export async function GET() {
  try {
    // Prepare cookie clearing headers
    const cookieNames = [
      'next-auth.session-token',
      'next-auth.callback-url',
      'next-auth.csrf-token',
      '__Secure-next-auth.session-token',
      '__Secure-next-auth.callback-url',
      '__Secure-next-auth.csrf-token',
      '__Host-next-auth.csrf-token',
      'next-auth.pkce.code_verifier'
    ];

    const clearCookieHeaders = cookieNames.reduce((headers, name) => {
      headers.append('Set-Cookie', `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`);
      headers.append('Set-Cookie', `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax; Secure`);
      return headers;
    }, new Headers());

    clearCookieHeaders.append('Cache-Control', 'no-store, max-age=0, must-revalidate');
    clearCookieHeaders.append('Pragma', 'no-cache');
    clearCookieHeaders.append('Expires', '0');
    clearCookieHeaders.append('Clear-Site-Data', '"cache", "cookies", "storage"');

    // Return success with clear cookie headers
    return NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { 
        status: 200,
        headers: clearCookieHeaders
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false, message: 'Error logging out' }, { status: 500 });
  }
} 