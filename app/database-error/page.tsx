"use client";

import Link from 'next/link';
import { FiDatabase, FiRefreshCw, FiHome } from 'react-icons/fi';
import { useState } from 'react';

export default function DatabaseErrorPage() {
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<'error' | 'checking' | 'connected'>('error');
  
  const checkConnection = async () => {
    setIsChecking(true);
    setStatus('checking');
    
    try {
      const response = await fetch('/api/check-db-status');
      const data = await response.json();
      
      if (data.connected) {
        setStatus('connected');
        // Redirect to home page after successful connection
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setIsChecking(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-4">
      <div className="bg-secondary rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-900 bg-opacity-20 p-4 rounded-full mb-4">
            <FiDatabase className="text-red-500 text-4xl" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">Database Connection Error</h1>
          
          <p className="text-gray-400 mb-6">
            We're having trouble connecting to our database. This might be due to maintenance or 
            temporary connectivity issues.
          </p>
          
          {status === 'connected' ? (
            <div className="bg-green-900 bg-opacity-20 text-green-500 p-4 rounded-lg mb-6 w-full">
              Connected to database! Redirecting to home page...
            </div>
          ) : status === 'checking' ? (
            <div className="bg-yellow-900 bg-opacity-20 text-yellow-500 p-4 rounded-lg mb-6 w-full">
              Checking database connection...
            </div>
          ) : (
            <div className="bg-red-900 bg-opacity-20 text-red-500 p-4 rounded-lg mb-6 w-full">
              Unable to connect to database. Please try again.
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button
              onClick={checkConnection}
              disabled={isChecking}
              className="bg-primary hover:bg-primary-dark disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg flex items-center justify-center flex-1 transition-colors"
            >
              {isChecking ? (
                <>
                  <FiRefreshCw className="animate-spin mr-2" />
                  Checking...
                </>
              ) : (
                <>
                  <FiRefreshCw className="mr-2" />
                  Try Again
                </>
              )}
            </button>
            
            <Link 
              href="/"
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg flex items-center justify-center flex-1 transition-colors"
            >
              <FiHome className="mr-2" />
              Return Home
            </Link>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-gray-500 text-sm max-w-md text-center">
        <p>
          If this problem persists, the database might be experiencing technical issues.
          Please try again later or contact support.
        </p>
      </div>
    </div>
  );
} 