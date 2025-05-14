'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AccountSidebar from '@/app/components/AccountSidebar';
import { toast } from 'react-hot-toast';

// Force server-side rendering to ensure we always have the latest session data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Force redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'authenticated') {
      setLoading(false);
    }
  }, [session, status, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status !== 'authenticated' || !session) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-bold mb-4">You need to be signed in to view this page</h1>
        <Link href="/login" className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-dark min-h-screen text-white pb-8">
      <div className="container-custom pt-8">
        <h1 className="text-4xl font-bold mb-8">Account Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-3">
            <AccountSidebar user={session.user} />
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-9 space-y-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 