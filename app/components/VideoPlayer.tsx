"use client";

import { useState, useEffect } from 'react';
import { IExternalVideo } from '@/lib/models/ExternalVideo';

interface VideoPlayerProps {
  video: IExternalVideo;
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Increment view count when video is loaded
    const incrementViews = async () => {
      try {
        await fetch(`/api/external-videos/${video._id}?increment=true`, {
          method: 'GET',
        });
      } catch (error) {
        console.error('Failed to increment view count', error);
      }
    };
    
    incrementViews();
  }, [video._id]);
  
  const handleIframeLoad = () => {
    setIsLoading(false);
  };
  
  return (
    <div className="w-full bg-black rounded-lg overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
      
      <div className="aspect-w-16 aspect-h-9">
        <iframe
          src={video.embedUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          onLoad={handleIframeLoad}
        ></iframe>
      </div>
      
      <div className="p-4 bg-gray-800 text-white">
        <h1 className="text-xl font-bold mb-2">{video.title}</h1>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <span className="text-sm">{video.platform}</span>
            {video.performerName && (
              <span className="text-sm">Model: {video.performerName}</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            <span>{video.views}</span>
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