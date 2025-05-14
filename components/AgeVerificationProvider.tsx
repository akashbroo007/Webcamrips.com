"use client"

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import AgeVerification from './AgeVerification';

interface AgeVerificationContextType {
  isVerified: boolean;
  setVerified: (value: boolean) => void;
}

const AgeVerificationContext = createContext<AgeVerificationContextType>({
  isVerified: false,
  setVerified: () => {},
});

export const useAgeVerification = () => useContext(AgeVerificationContext);

interface AgeVerificationProviderProps {
  children: ReactNode;
}

export default function AgeVerificationProvider({ children }: AgeVerificationProviderProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user has already verified their age
    const verified = localStorage.getItem('ageVerified') === 'true';
    setIsVerified(verified);
    setIsLoading(false);
  }, []);
  
  const handleVerification = () => {
    setIsVerified(true);
  };
  
  return (
    <AgeVerificationContext.Provider value={{ isVerified, setVerified: setIsVerified }}>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-dark">
          <div className="text-white">Loading...</div>
        </div>
      ) : (
        <>
          {!isVerified && <AgeVerification onVerified={handleVerification} />}
          {children}
        </>
      )}
    </AgeVerificationContext.Provider>
  );
} 