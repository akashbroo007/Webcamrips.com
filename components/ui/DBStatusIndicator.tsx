"use client";

import { useState, useEffect } from 'react';
import { FiDatabase, FiAlertCircle } from 'react-icons/fi';

export default function DBStatusIndicator() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [message, setMessage] = useState('Checking database connection...');
  
  useEffect(() => {
    const checkDBStatus = async () => {
      try {
        const response = await fetch('/api/check-db-status');
        
        if (response.ok) {
          const data = await response.json();
          if (data.connected) {
            setStatus('connected');
            setMessage('Database connected');
          } else {
            setStatus('error');
            setMessage(data.message || 'Could not connect to database');
          }
        } else {
          setStatus('error');
          setMessage('Error checking database status');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Could not check database status');
      }
    };
    
    checkDBStatus();
    
    // Check connection status periodically
    const interval = setInterval(checkDBStatus, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, []);
  
  if (status === 'connected') {
    return (
      <div className="flex items-center text-green-500 text-xs">
        <FiDatabase className="mr-1" />
        <span className="hidden md:inline">Database connected</span>
      </div>
    );
  }
  
  if (status === 'error') {
    return (
      <div className="flex items-center text-red-500 text-xs" title={message}>
        <FiAlertCircle className="mr-1" />
        <span className="hidden md:inline">Database error</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center text-yellow-500 text-xs">
      <FiDatabase className="mr-1 animate-pulse" />
      <span className="hidden md:inline">Connecting...</span>
    </div>
  );
} 