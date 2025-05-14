'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SessionErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isClearing, setIsClearing] = useState(true);
  const [clearingComplete, setClearingComplete] = useState(false);
  
  useEffect(() => {
    // Get error type from URL
    const errorType = searchParams?.get('type') || 'unknown';
    console.log('Session error recovery page loaded:', errorType);
    
    // Function to clear all cookies
    const clearAllCookies = () => {
      try {
        // Get all cookies
        const cookies = document.cookie.split(';');
        
        // Delete each cookie
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + window.location.hostname;
        }
        
        // Clear local storage
        localStorage.clear();
        sessionStorage.clear();
        
        return true;
      } catch (error) {
        console.error('Error clearing cookies:', error);
        return false;
      }
    };
    
    // Call API to clear server-side cookies
    const clearServerSessions = async () => {
      try {
        const response = await fetch('/api/auth/clear-sessions', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        return response.ok;
      } catch (error) {
        console.error('Error calling clear-sessions API:', error);
        return false;
      }
    };
    
    // Execute cleaning
    const executeCleanup = async () => {
      // First clear client-side storage
      const clientCleared = clearAllCookies();
      
      // Then try to clear server-side sessions
      const serverCleared = await clearServerSessions();
      
      console.log('Cleanup complete:', { clientCleared, serverCleared });
      
      // Mark clearing as complete
      setIsClearing(false);
      setClearingComplete(true);
      
      // After a short delay, redirect to login
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    };
    
    executeCleanup();
  }, [router, searchParams]);
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-5 text-white">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Session Recovery</h1>
        
        {isClearing ? (
          <>
            <div className="mb-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
            </div>
            <p>Cleaning up session data...</p>
            <p className="text-gray-400 text-sm mt-2">This will only take a moment.</p>
          </>
        ) : (
          <>
            <div className="text-green-400 text-5xl mb-4">✓</div>
            <h2 className="text-xl mb-4">Session Cleanup Complete</h2>
            <p className="mb-6">You'll be redirected to the login page in a moment.</p>
            <div>
              <Link 
                href="/login" 
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Go to Login Now
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 