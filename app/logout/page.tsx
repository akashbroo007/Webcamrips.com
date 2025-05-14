'use client';

import React, { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Call the API to clear session server-side
        await fetch('/api/auth/logout', { 
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        });
        
        // Clear all session storage
        sessionStorage.clear();
        
        // Clear all local storage
        localStorage.clear();
        
        // Clear all cookies more aggressively
        document.cookie.split(";").forEach(function(c) { 
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
          document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Domain=${window.location.hostname}; SameSite=Lax`;
          document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Domain=${window.location.hostname}; SameSite=Lax; Secure`;
          // Also try without domain
          document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
        });
        
        // Force the signOut with redirect
        await signOut({ 
          callbackUrl: '/',
          redirect: false
        });
        
        // Forced navigation with cache busting
        const cacheBuster = new Date().getTime();
        window.location.href = `/?logout=${cacheBuster}`;
      } catch (error) {
        console.error('Logout error:', error);
        // Force hard reload to home
        window.location.href = '/';
      }
    };

    handleLogout();
  }, [router]);

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="bg-secondary p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-4 text-center">Logging out...</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      </div>
    </div>
  );
} 