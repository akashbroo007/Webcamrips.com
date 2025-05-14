'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';

interface Recording {
  id: string;
  modelName: string;
  platform: string;
  streamUrl: string;
  status: string;
  startTime: string;
  duration: number;
}

export default function RecordingsPage() {
  const router = useRouter();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [modelName, setModelName] = useState('');
  const [platform, setPlatform] = useState('chaturbate');
  const [streamUrl, setStreamUrl] = useState('');
  const [quality, setQuality] = useState('best');
  const [duration, setDuration] = useState(120); // 2 hours in minutes
  
  // Load existing recordings
  useEffect(() => {
    fetchRecordings();
  }, []);
  
  const fetchRecordings = async () => {
    try {
      const response = await fetch('/api/admin/recordings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch recordings');
      }
      
      const data = await response.json();
      setRecordings(data);
    } catch (error) {
      console.error('Error fetching recordings:', error);
      setError('Failed to load recordings');
    }
  };
  
  const handleStartRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate form data
      if (!modelName || !streamUrl) {
        throw new Error('Model name and stream URL are required');
      }
      
      // Send request to API
      const response = await fetch('/api/admin/recordings/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelName,
          platform,
          streamUrl,
          quality,
          duration: duration * 60 // Convert minutes to seconds
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start recording');
      }
      
      // Reset form
      setModelName('');
      setStreamUrl('');
      
      // Refresh recordings list
      fetchRecordings();
      
      // Show success message
      alert('Recording started successfully!');
    } catch (error: any) {
      console.error('Error starting recording:', error);
      setError(error.message || 'Failed to start recording');
    } finally {
      setIsLoading(false);
    }
  };
  
  const platforms = [
    { value: 'chaturbate', label: 'Chaturbate' },
    { value: 'myfreecams', label: 'MyFreeCams' },
    { value: 'stripchat', label: 'Stripchat' },
    { value: 'bongacams', label: 'BongaCams' },
    { value: 'camsoda', label: 'Camsoda' },
    { value: 'cam4', label: 'Cam4' },
    { value: 'streamate', label: 'Streamate' },
    { value: 'flirt4free', label: 'Flirt4Free' },
  ];
  
  const qualityOptions = [
    { value: 'best', label: 'Best Quality' },
    { value: 'high', label: 'High Quality' },
    { value: 'medium', label: 'Medium Quality' },
    { value: 'low', label: 'Low Quality' },
  ];
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Recording Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Start Recording Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Start New Recording</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            <form onSubmit={handleStartRecording}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Model Name
                </label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {platforms.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Stream URL
                </label>
                <input
                  type="text"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Quality
                  </label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {qualityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    min="1"
                    max="360"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? 'Starting...' : 'Start Recording'}
              </button>
            </form>
          </div>
          
          {/* Active Recordings */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Active Recordings</h2>
            
            {recordings.length === 0 ? (
              <p className="text-gray-500">No active recordings found.</p>
            ) : (
              <div className="space-y-4">
                {recordings.map((recording) => (
                  <div key={recording.id} className="border rounded-lg p-4">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{recording.modelName}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        recording.status === 'recording' 
                          ? 'bg-green-100 text-green-800' 
                          : recording.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {recording.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{recording.platform}</p>
                    <p className="text-sm text-gray-500 truncate">{recording.streamUrl}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      Started: {new Date(recording.startTime).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 