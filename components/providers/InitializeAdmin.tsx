'use client';

import { useEffect, useState } from 'react';

export default function InitializeAdmin() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        // Only need to run this once per session
        if (initialized) return;
        
        // Call the initialization API
        const response = await fetch('/api/admin/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });
        
        if (response.ok) {
          console.log('Admin initialization complete');
          setInitialized(true);
        }
      } catch (error) {
        console.error('Failed to initialize admin:', error);
      }
    };

    initializeAdmin();
  }, [initialized]);

  // This component doesn't render anything visible
  return null;
} 