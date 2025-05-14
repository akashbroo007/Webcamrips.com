'use client';

import { createContext, useState, useContext, useEffect } from 'react';

// Create the context
interface AgeVerificationContextType {
  isVerified: boolean;
  setVerified: (value: boolean) => void;
}

const AgeVerificationContext = createContext<AgeVerificationContextType>({
  isVerified: false,
  setVerified: () => {},
});

// Export the context hook
export const useAgeVerification = () => useContext(AgeVerificationContext);

// Provider component
export default function AgeVerificationProvider({ children }: { children: React.ReactNode }) {
  const [isVerified, setVerified] = useState<boolean>(false);
  
  // On mount, check if the user has already verified their age
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ageVerified');
      if (stored === 'true') {
        setVerified(true);
      }
    } catch (e) {
      // Handle localStorage being unavailable
      console.error('Error accessing localStorage:', e);
    }
  }, []);

  // When verification status changes, store it
  useEffect(() => {
    try {
      if (isVerified) {
        localStorage.setItem('ageVerified', 'true');
      }
    } catch (e) {
      console.error('Error setting localStorage:', e);
    }
  }, [isVerified]);

  return (
    <AgeVerificationContext.Provider value={{ isVerified, setVerified }}>
      {children}
    </AgeVerificationContext.Provider>
  );
} 