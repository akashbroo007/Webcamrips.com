'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

/**
 * Component to handle HTTP 431 and other session-related errors
 * This should be included in the main layout or dashboard component
 */
export default function SessionErrorHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const [isRecovering, setIsRecovering] = useState(false);

  // Function to clear all sessions and cookies
  const clearSessions = async () => {
    try {
      await fetch('/api/auth/clear-sessions', { 
        method: 'GET',
        cache: 'no-store'
      });
      return true;
    } catch (error) {
      console.error('Failed to clear sessions:', error);
      return false;
    }
  };

  // Handle 431 errors by monitoring for network errors
  useEffect(() => {
    const handleNetworkError = async (event: ErrorEvent) => {
      // Check if this looks like a header size error
      if (
        event.message?.includes('431') || 
        event.message?.includes('header') || 
        event.message?.includes('Failed to fetch')
      ) {
        console.log('SessionErrorHandler: Detected possible header size error');
        
        // Prevent multiple recovery attempts
        if (isRecovering) return;
        setIsRecovering(true);
        
        // Redirect to the dedicated session error page
        window.location.href = '/session-error?type=network_error';
      }
    };

    // Listen for global errors
    window.addEventListener('error', handleNetworkError);
    
    return () => {
      window.removeEventListener('error', handleNetworkError);
    };
  }, [isRecovering]);

  // Monitor for Response header errors from fetch API
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        return response;
      } catch (error: any) {
        // Check if this is a header size error
        if (
          error.message?.includes('431') ||
          error.message?.includes('header') ||
          error.name === 'TypeError'
        ) {
          console.log('SessionErrorHandler: Intercepted fetch error', error.message);
          
          if (!isRecovering) {
            setIsRecovering(true);
            
            // Redirect to the dedicated session error page
            window.location.href = '/session-error?type=fetch_error';
          }
        }
        throw error;
      }
    };
    
    return () => {
      window.fetch = originalFetch;
    };
  }, [isRecovering]);

  // This component doesn't render anything
  return null;
} 