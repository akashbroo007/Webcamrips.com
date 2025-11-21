"use client";

import { useState, useEffect } from 'react';
import { IExternalVideo } from '@/lib/models/ExternalVideo';

interface VideoPlayerProps {
  video: IExternalVideo;
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!video || !video._id) {
      setError("Invalid video data");
      setIsLoading(false);
      return;
    }
    
    // Increment view count when video is loaded
    const incrementViews = async () => {
      try {
        const response = await fetch(`/api/external-videos/${video._id}?increment=true`, {
          method: 'GET',
        });
        
        if (!response.ok) {
          console.warn('Failed to increment view count', await response.text());
        }
      } catch (error) {
        console.error('Failed to increment view count', error);
      }
    };
    
    incrementViews();
  }, [video?._id]);
  
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setError("Failed to load video. Please try again later.");
    setIsLoading(false);
  };
  
  if (!video || !video.embedUrl) {
    return (
      <div className="w-full bg-black rounded-lg overflow-hidden flex items-center justify-center p-8">
        <div className="text-white text-center">
          <p className="text-xl">Video not available</p>
          <p className="text-sm mt-2">The requested video could not be loaded</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full bg-black rounded-lg overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
          <div className="text-white text-center p-4">
            <p className="text-xl">{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-primary rounded-lg hover:bg-primary-dark"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      <div className="aspect-w-16 aspect-h-9">
        <iframe
          src={video.embedUrl}
          title={video.title || "Video Player"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        ></iframe>
      </div>
      
      <div className="p-4 bg-gray-800 text-white">
        <h1 className="text-xl font-bold mb-2">{video.title || "Untitled Video"}</h1>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <span className="text-sm">{video.platform || "Unknown"}</span>
            {video.performerName && (
              <span className="text-sm">Model: {video.performerName}</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            <span>{video.views || 0}</span>
          </div>
        </div>
        
        {video.description && (
          <div className="mt-4 text-sm">
            <p>{video.description}</p>
          </div>
        )}
      </div>
    </div>
  );
} 