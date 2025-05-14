'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Session } from 'next-auth';

// Extend the Session type to include custom user properties
interface CustomSession extends Session {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    isAdmin: boolean;
    isPremium: boolean;
  }
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const customSession = session as CustomSession;
  const [forceLoggedOut, setForceLoggedOut] = useState(false);
  
  // Check if user is admin
  const isAdmin = customSession?.user?.isAdmin;

  // Force-rerender on logout param in URL
  useEffect(() => {
    const logoutParam = searchParams.get('logout');
    if (logoutParam) {
      setForceLoggedOut(true);
    }
  }, [searchParams]);

  // Reset forceLoggedOut when status changes to authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      setForceLoggedOut(false);
    }
  }, [status]);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    setForceLoggedOut(true);
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  // Force refresh when session status changes
  useEffect(() => {
    if (status === 'unauthenticated' && (pathname?.includes('/account') || pathname?.includes('/admin'))) {
      router.push('/');
    }
  }, [status, pathname, router]);

  // Determine if we should show logged in state
  const showLoggedIn = status === 'authenticated' && session && !forceLoggedOut;

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            WebcamRips
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className={`text-gray-600 hover:text-gray-900 ${
                pathname === '/' ? 'font-semibold' : ''
              }`}
            >
              Home
            </Link>
            <Link
              href="/videos"
              className={`text-gray-600 hover:text-gray-900 ${
                pathname === '/videos' ? 'font-semibold' : ''
              }`}
            >
              Videos
            </Link>
            <Link
              href="/performers"
              className={`text-gray-600 hover:text-gray-900 ${
                pathname === '/performers' ? 'font-semibold' : ''
              }`}
            >
              Performers
            </Link>
            <Link
              href="/upload"
              className={`text-gray-600 hover:text-gray-900 ${
                pathname === '/upload' ? 'font-semibold' : ''
              }`}
            >
              Upload
            </Link>
            {isAdmin && !forceLoggedOut && (
              <Link
                href="/admin"
                className={`text-gray-600 hover:text-gray-900 ${
                  pathname?.startsWith('/admin') ? 'font-semibold' : ''
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {showLoggedIn ? (
              <>
                <Link href="/account/settings" className="text-gray-600 hover:text-gray-900">
                  {session.user?.name || session.user?.email}
                </Link>
                <Link
                  href="/logout"
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Logout
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 