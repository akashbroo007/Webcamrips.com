'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Define the props for the AuthProvider component
interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [sessionChecked, setSessionChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Function to renew session by revalidating the session endpoint
  const renewSession = async () => {
    try {
      // Force a revalidation of the session
      const res = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, max-age=0',
          'Pragma': 'no-cache'
        }
      });
      
      if (!res.ok) {
        console.error('Failed to renew session');
      }
    } catch (error) {
      console.error('Error renewing session:', error);
    }
  };

  // Session health check effect
  useEffect(() => {
    // Skip checks for auth-related paths
    if (
      pathname?.startsWith('/api/') ||
      pathname === '/login' ||
      pathname === '/register' ||
      pathname === '/logout'
    ) {
      setSessionChecked(true);
      return;
    }

    // Check if there are header size issues
    const checkCookieSize = () => {
      const cookies = document.cookie;
      const cookieSize = new TextEncoder().encode(cookies).length;
      
      // If cookies are getting large, force a renewal
      if (cookieSize > 3000) { // 3KB threshold
        console.log('Large cookies detected, refreshing session');
        renewSession();
      }
    };

    // Run cookie size check
    checkCookieSize();
    setSessionChecked(true);

    // Set up periodic session renewal for long-lived pages
    const intervalId = setInterval(renewSession, 60 * 60 * 1000); // Every hour
    
    return () => clearInterval(intervalId);
  }, [pathname]);

  // Only render children once we've checked the session
  if (!sessionChecked && pathname !== '/login' && pathname !== '/register') {
    return null; // Or a loading spinner
  }

  return <SessionProvider>{children}</SessionProvider>;
} 