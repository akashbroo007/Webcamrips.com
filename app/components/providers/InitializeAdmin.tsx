'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

// Component to initialize admin features when an admin user logs in
export default function InitializeAdmin({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin;

  useEffect(() => {
    // Only run for admin users
    if (!isAdmin) return;

    const setupAdminFeatures = async () => {
      try {
        // Preload any admin-specific resources or data
        // This helps reduce loading times when admin users navigate to admin pages
        await fetch('/api/admin/stats', { 
          method: 'GET',
          headers: { 'X-Preload': 'true' }
        });
      } catch (error) {
        console.error('Failed to initialize admin features:', error);
      }
    };

    setupAdminFeatures();
  }, [isAdmin]);

  // This component doesn't modify the UI, it just initializes admin features
  return <>{children}</>;
} 