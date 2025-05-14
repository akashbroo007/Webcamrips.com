"use client"

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VideoGrid from '@/components/video/VideoGrid';
import { FiFilter } from 'react-icons/fi';
import { useState, useEffect } from 'react';

const VideosPage = () => {
  const [sortBy, setSortBy] = useState('newest');
  const [platform, setPlatform] = useState('all');
  const [duration, setDuration] = useState('all');
  const [shouldRefetch, setShouldRefetch] = useState(0);

  // This causes the VideoGrid to re-fetch when filters change
  useEffect(() => {
    setShouldRefetch(prev => prev + 1);
  }, [sortBy, platform, duration]);

  // Helper function to map UI filter values to API parameters
  const getApiSortValue = (uiValue: string) => {
    const mapping: Record<string, string> = {
      'latest': 'newest',
      'popular': 'views',
      'trending': 'views',
      'longest': 'duration'
    };
    return mapping[uiValue] || uiValue;
  };

  return (
    <>
      <Header />
      <main className="bg-secondary min-h-screen py-10">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-8">Latest Videos</h1>
          
          {/* Filters */}
          <div className="bg-dark rounded-lg p-4 mb-8">
            <div className="flex flex-wrap gap-4">
              <select 
                className="bg-secondary rounded px-4 py-2 text-sm" 
                value={sortBy}
                onChange={(e) => {
                  setSortBy(getApiSortValue(e.target.value));
                }}
              >
                <option value="newest">Latest</option>
                <option value="views">Most Viewed</option>
                <option value="duration">Longest</option>
              </select>
              
              <select 
                className="bg-secondary rounded px-4 py-2 text-sm"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <option value="all">All Platforms</option>
                <option value="Chaturbate">Chaturbate</option>
                <option value="Stripchat">Stripchat</option>
                <option value="BongaCams">BongaCams</option>
                <option value="LiveJasmin">LiveJasmin</option>
                <option value="MyFreeCams">MyFreeCams</option>
                <option value="Camsoda">Camsoda</option>
              </select>
              
              <select 
                className="bg-secondary rounded px-4 py-2 text-sm"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="all">Any Duration</option>
                <option value="short">Short (&lt; 10 min)</option>
                <option value="medium">Medium (10-30 min)</option>
                <option value="long">Long (&gt; 30 min)</option>
              </select>
            </div>
          </div>
          
          {/* Videos Grid */}
          <VideoGrid 
            key={shouldRefetch} // Add key to force re-render when filters change
            title="Latest Videos"
            endpoint="/api/videos"
            showFilters={false}
            limit={20}
            initialSortBy={sortBy}
            initialPlatform={platform}
            initialDuration={duration}
          />
          
          {/* Pagination handled by VideoGrid component */}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default VideosPage; 