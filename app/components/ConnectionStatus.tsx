"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    // Update online status
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('You are back online!');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline. Some features may be unavailable.');
    };
    
    // Set up event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set initial state
    setIsOnline(navigator.onLine);
    
    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // This component doesn't render anything visible
  // It just handles network status changes
  return null;
} 