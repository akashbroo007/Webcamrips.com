"use client"

import React, { useState, useEffect } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface AgeVerificationProps {
  onVerified: () => void;
}

export default function AgeVerification({ onVerified }: AgeVerificationProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  
  const handleContinue = () => {
    // Show loading indicator
    setShowLoading(true);
    
    // Delay to simulate loading
    setTimeout(() => {
      setIsVisible(false);
      
      // Execute the callback when verified
      onVerified();
      
      // Store in localStorage that the user has verified
      localStorage.setItem('ageVerified', 'true');
    }, 800);
  };
  
  return isVisible ? (
    <div className="fixed inset-0 z-50 bg-dark flex items-center justify-center p-4">
      <div className="text-center max-w-2xl animate-fade-in">
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
          {showLoading ? (
            <div className="inline-flex items-center">
              <div className="w-5 h-5 border-t-2 border-r-2 border-primary rounded-full animate-spin mr-2"></div>
              <span className="text-gray-300">Loading...</span>
            </div>
          ) : (
            <button 
              onClick={handleContinue}
              className="bg-primary hover:bg-primary-dark text-white font-semibold rounded-full px-8 py-3 inline-flex items-center transition-colors"
            >
              <span>Continue</span> <FiArrowRight className="ml-2" />
            </button>
          )}
        </div>
        
        {/* Warning Text */}
        <p className="text-gray-400 text-lg">
          The site contains sexually explicit material, enter only if you are over 18
        </p>
      </div>
    </div>
  ) : null;
} 