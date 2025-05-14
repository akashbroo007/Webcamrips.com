"use client"

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('code') || '500';
  const errorMessage = searchParams.get('message') || 'An error occurred';
  
  // Handle specific error types
  const isHeaderError = errorCode === '431';

  const handleClearSession = () => {
    // Clear all cookies and local storage
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    
    localStorage.clear();
    sessionStorage.clear();
    
    // Reload the page
    window.location.href = '/';
  };

  return (
    <>
      <Header />
      <main className="bg-dark min-h-screen py-20">
        <div className="container-custom max-w-2xl mx-auto text-center">
          <div className="bg-secondary rounded-lg p-8 shadow-lg">
            <h1 className="text-4xl font-bold mb-4 text-white">Error {errorCode}</h1>
            
            <p className="text-lg text-gray-300 mb-8">{errorMessage}</p>
            
            {isHeaderError ? (
              <div>
                <p className="text-gray-400 mb-6">
                  Your browser is sending too much data in the request headers. This is often caused by cookies 
                  or other browser data getting too large.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                  <button
                    onClick={handleClearSession}
                    className="bg-primary hover:bg-primary-dark text-white font-medium rounded px-6 py-3 transition-colors"
                  >
                    Clear Session Data & Reload
                  </button>
                  
                  <Link 
                    href="/"
                    className="bg-gray-700 hover:bg-gray-600 text-white font-medium rounded px-6 py-3 transition-colors"
                  >
                    Return Home
                  </Link>
                </div>
                
                <p className="text-sm text-gray-500">
                  If the problem persists after clearing your session, try using a private/incognito window
                  or clearing your browser cache and cookies completely.
                </p>
              </div>
            ) : (
              <div className="flex justify-center">
                <Link 
                  href="/"
                  className="bg-primary hover:bg-primary-dark text-white font-medium rounded px-6 py-3 transition-colors"
                >
                  Return Home
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 