"use client";

import React, { useEffect, useState, useCallback } from 'react';
import VideoCard from './VideoCard';
import { FiFilter, FiLoader } from 'react-icons/fi';

interface Video {
  _id: string;
  title: string;
  thumbnail?: string;
  duration?: number;
  formattedDuration?: string;
  views?: number;
  platform?: string;
  createdAt?: string;
  fileUrl?: string;
  performerId?: string;
  performer?: {
    name?: string;
  };
}

interface VideoGridProps {
  title?: string;
  endpoint?: string;
  initialVideos?: Video[];
  showFilters?: boolean;
  limit?: number;
  initialSortBy?: string;
  initialPlatform?: string;
  initialDuration?: string;
}

const VideoGrid: React.FC<VideoGridProps> = ({
  title = "Latest Videos",
  endpoint = "/api/videos",
  initialVideos = [],
  showFilters = true,
  limit = 12,
  initialSortBy = 'newest',
  initialPlatform = 'all',
  initialDuration = 'all'
}) => {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [loading, setLoading] = useState<boolean>(initialVideos.length === 0);
  const [platform, setPlatform] = useState<string>(initialPlatform);
  const [sortBy, setSortBy] = useState<string>(initialSortBy);
  const [duration, setDuration] = useState<string>(initialDuration);
  const [error, setError] = useState<string | null>(null);

  // Update state when props change
  useEffect(() => {
    setPlatform(initialPlatform);
    setSortBy(initialSortBy);
    setDuration(initialDuration);
  }, [initialPlatform, initialSortBy, initialDuration]);

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
      
      // Handle duration filter
      if (duration !== 'all') {
        queryParams.append('duration', duration);
      }
      
      const response = await fetch(`${endpoint}?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch videos: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.videos || !Array.isArray(data.videos)) {
        console.error('Unexpected response format:', data);
        setVideos([]);
        setError('Received invalid data from server. Please try again later.');
      } else {
        setVideos(data.videos);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Failed to load videos. Please try again later.');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, [platform, sortBy, duration, limit, endpoint]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Format date helper function
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
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
        <div className="bg-error bg-opacity-20 text-error-content rounded-lg p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <FiLoader className="animate-spin text-primary text-3xl mr-2" />
          <span className="text-gray-400">Loading videos...</span>
        </div>
      ) : videos.length === 0 ? (
        <div className="bg-secondary rounded-lg p-8 text-center">
          <p className="text-gray-400">No videos found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard
              key={video._id}
              id={video._id}
              title={video.title}
              thumbnail={video.thumbnail}
              duration={video.formattedDuration}
              views={video.views || 0}
              date={formatDate(video.createdAt)}
              platform={video.platform}
              performer={video.performer?.name}
              videoUrl={video.fileUrl || ''}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoGrid; 