"use client";

import React, { useEffect, useState, useCallback } from 'react';
import VideoCard from './VideoCard';
import { FiFilter, FiLoader } from 'react-icons/fi';

interface Video {
  _id: string;
  title: string;
  thumbnail?: string;
  duration: number;
  formattedDuration?: string;
  views: number;
  platform: string;
  createdAt: string;
  fileUrl?: string;
  performerId?: string;
  performer?: {
    name: string;
  };
}

interface VideoGridProps {
  title?: string;
  endpoint?: string;
  initialVideos?: Video[];
  showFilters?: boolean;
  limit?: number;
}

const VideoGrid: React.FC<VideoGridProps> = ({
  title = "Latest Videos",
  endpoint = "/api/videos",
  initialVideos = [],
  showFilters = true,
  limit = 12
}) => {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [loading, setLoading] = useState<boolean>(initialVideos.length === 0);
  const [platform, setPlatform] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      
      if (platform !== 'all') {
        queryParams.append('platform', platform);
      }
      
      queryParams.append('sort', sortBy);
      queryParams.append('limit', limit.toString());
      
      const response = await fetch(`${endpoint}?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      
      const data = await response.json();
      if (!data.videos) {
        throw new Error('Invalid response format');
      }
      setVideos(data.videos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError(error instanceof Error ? error.message : 'Failed to load videos');
      setVideos([]); // Set empty videos array instead of sample data
    } finally {
      setLoading(false);
    }
  }, [platform, sortBy, limit, endpoint]);

  useEffect(() => {
    if (initialVideos.length === 0) {
      fetchVideos();
    }
  }, [platform, sortBy, fetchVideos, initialVideos.length]);

  const formatDuration = (duration: number): string => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-grid-container mb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        
        {showFilters && (
          <div className="flex space-x-4">
            <div className="flex items-center">
              <label htmlFor="platformFilter" className="text-gray-400 mr-2 hidden sm:inline">Platform:</label>
              <select
                id="platformFilter"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="bg-secondary text-white border border-gray-700 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Platforms</option>
                <option value="Chaturbate">Chaturbate</option>
                <option value="Stripchat">Stripchat</option>
                <option value="BongaCams">BongaCams</option>
                <option value="LiveJasmin">LiveJasmin</option>
                <option value="MyFreeCams">MyFreeCams</option>
                <option value="Camsoda">Camsoda</option>
              </select>
            </div>

            <div className="flex items-center">
              <label htmlFor="sortFilter" className="text-gray-400 mr-2 hidden sm:inline">Sort:</label>
              <select
                id="sortFilter"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-secondary text-white border border-gray-700 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="views">Most Views</option>
                <option value="duration">Longest</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <FiLoader className="animate-spin text-primary text-3xl mr-2" />
          <span className="text-gray-400">Loading videos...</span>
        </div>
      ) : videos.length === 0 ? (
        <div className="bg-secondary rounded-lg p-8 text-center">
          <p className="text-gray-400">No videos found. Please check back later or try different filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard
              key={video._id}
              id={video._id}
              title={video.title}
              thumbnail={video.thumbnail || '/images/placeholder.jpg'}
              duration={video.formattedDuration || formatDuration(video.duration)}
              views={video.views}
              date={new Date(video.createdAt).toLocaleDateString()}
              platform={video.platform}
              performer={video.performer?.name}
              videoUrl={video.fileUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoGrid; 