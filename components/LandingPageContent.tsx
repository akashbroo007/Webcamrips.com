"use client"

import React, { useState, useEffect } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LandingPageContent() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Render a loading state during SSR
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  return (
    <main className="min-h-screen flex items-center justify-center bg-dark p-4">
      <div className="text-center max-w-2xl">
        {/* Logo/Icon */}
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl">
            <span className="text-3xl">🎥</span>
          </div>
        </div>
        
        {/* Description Text */}
        <p className="text-gray-300 mb-10 text-lg">
          Millions of archive videos of cam models around the world on WebcamRips
        </p>
        
        {/* Age Verification */}
        <div className="text-white text-7xl font-bold mb-10">
          18+
        </div>
        
        {/* Continue Button */}
        <div className="mb-10 text-center">
          <button 
            onClick={() => router.push('/videos')}
            className="bg-primary hover:bg-primary-dark text-white font-semibold rounded-full px-8 py-3 inline-flex items-center transition-colors"
          >
            <span>Continue</span> <FiArrowRight className="ml-2" />
          </button>
        </div>
        
        {/* Warning Text */}
        <p className="text-gray-400 text-lg">
          The site contains sexually explicit material, enter only if you are over 18
        </p>
      </div>
    </main>
  );
} 