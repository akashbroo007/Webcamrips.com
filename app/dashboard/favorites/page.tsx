"use client"

import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import { FiHeart, FiFilter, FiClock, FiCalendar, FiEye } from 'react-icons/fi';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VideoCard from '@/components/video/VideoCard';

// Mock favorites data - would be fetched from API in production
const userFavorites = [
  { 
    id: 1, 
    title: 'Alisa_wonderland private session', 
    thumbnail: '/images/thumb4.jpg', 
    duration: '32:18',
    views: 4321,
    date: '2023-12-12',
    platform: 'BongaCams',
    addedToFavorites: '2023-12-20'
  },
  { 
    id: 2, 
    title: 'Midnight_lotus exclusive content', 
    thumbnail: '/images/thumb5.jpg', 
    duration: '27:55',
    views: 6543,
    date: '2023-12-11',
    platform: 'LiveJasmin',
    addedToFavorites: '2023-12-19'
  },
  { 
    id: 3, 
    title: 'Wildrose_ premium archive show', 
    thumbnail: '/images/thumb6.jpg', 
    duration: '36:40',
    views: 7832,
    date: '2023-12-10',
    platform: 'MyFreeCams',
    addedToFavorites: '2023-12-18'
  },
  { 
    id: 4, 
    title: 'Lucy_star premium content', 
    thumbnail: '/images/thumb1.jpg', 
    duration: '29:15',
    views: 3254,
    date: '2023-12-09',
    platform: 'Chaturbate',
    addedToFavorites: '2023-12-17'
  },
  { 
    id: 5, 
    title: 'Moonlight_angel exclusive show', 
    thumbnail: '/images/thumb2.jpg', 
    duration: '41:22',
    views: 6745,
    date: '2023-12-08',
    platform: 'Stripchat',
    addedToFavorites: '2023-12-16'
  },
  { 
    id: 6, 
    title: 'Crystal_beauty live stream highlights', 
    thumbnail: '/images/thumb3.jpg', 
    duration: '22:10',
    views: 4578,
    date: '2023-12-07',
    platform: 'Chaturbate',
    addedToFavorites: '2023-12-15'
  },
];

const FavoritesPage: FC = () => {
  const [videos, setVideos] = useState(userFavorites);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [sortBy, setSortBy] = useState('addedToFavorites');
  const [isDescending, setIsDescending] = useState(true);

  // Apply filters and sorting
  useEffect(() => {
    let filteredVideos = [...userFavorites];
    
    // Apply platform filter
    if (selectedPlatform) {
      filteredVideos = filteredVideos.filter(video => video.platform === selectedPlatform);
    }
    
    // Apply sorting
    filteredVideos.sort((a, b) => {
      if (sortBy === 'addedToFavorites') {
        return isDescending 
          ? new Date(b.addedToFavorites).getTime() - new Date(a.addedToFavorites).getTime()
          : new Date(a.addedToFavorites).getTime() - new Date(b.addedToFavorites).getTime();
      } else if (sortBy === 'views') {
        return isDescending ? b.views - a.views : a.views - b.views;
      } else if (sortBy === 'title') {
        return isDescending 
          ? b.title.localeCompare(a.title) 
          : a.title.localeCompare(b.title);
      } else if (sortBy === 'date') {
        return isDescending 
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return 0;
    });
    
    setVideos(filteredVideos);
  }, [selectedPlatform, sortBy, isDescending]);

  // Remove from favorites handler (mock)
  const handleRemoveFavorite = (id: number) => {
    if (confirm('Remove this video from your favorites?')) {
      setVideos(videos.filter(video => video.id !== id));
    }
  };

  return (
    <>
      <Header />
      <main className="bg-dark min-h-screen py-8">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Favorites</h1>
              <p className="text-gray-400">Access your favorite videos</p>
            </div>
          </div>

          {/* Filters and Sorting */}
          <div className="bg-secondary p-4 rounded-lg mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-1">Platform</label>
                <select 
                  className="w-full bg-dark border border-gray-700 rounded-md p-2 text-white"
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                >
                  <option value="">All Platforms</option>
                  <option value="Chaturbate">Chaturbate</option>
                  <option value="Stripchat">Stripchat</option>
                  <option value="BongaCams">BongaCams</option>
                  <option value="LiveJasmin">LiveJasmin</option>
                  <option value="MyFreeCams">MyFreeCams</option>
                  <option value="Camsoda">Camsoda</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-1">Sort By</label>
                <select 
                  className="w-full bg-dark border border-gray-700 rounded-md p-2 text-white"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="addedToFavorites">Date Added</option>
                  <option value="date">Original Date</option>
                  <option value="views">Views</option>
                  <option value="title">Title</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-1">Order</label>
                <select 
                  className="w-full bg-dark border border-gray-700 rounded-md p-2 text-white"
                  value={isDescending ? 'desc' : 'asc'}
                  onChange={(e) => setIsDescending(e.target.value === 'desc')}
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {videos.length > 0 ? (
              videos.map((video) => (
                <div key={video.id} className="relative group">
                  <VideoCard 
                    id={video.id.toString()}
                    title={video.title}
                    thumbnail={video.thumbnail}
                    duration={video.duration}
                    views={video.views}
                    date={video.date}
                    platform={video.platform}
                    videoUrl={`/api/videos/${video.id}`}
                  />
                  <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleRemoveFavorite(video.id)} 
                      className="bg-red-600 p-2 rounded-full text-white"
                      title="Remove from favorites"
                    >
                      <FiHeart size={16} />
                    </button>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-primary bg-opacity-80 text-xs px-2 py-1 rounded">
                    <FiCalendar className="inline-block mr-1" />
                    Added: {new Date(video.addedToFavorites).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <FiHeart size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-medium mb-2">No favorites found</h3>
                <p className="text-gray-400 mb-6">You haven't added any videos to your favorites matching these filters.</p>
                <Link href="/videos" className="btn-primary inline-flex items-center">
                  <FiEye className="mr-2" />
                  Browse Videos
                </Link>
              </div>
            )}
          </div>

          {/* Pagination */}
          {videos.length > 0 && (
            <div className="flex justify-center mt-8">
              <div className="inline-flex rounded-md shadow-sm">
                <button className="bg-secondary hover:bg-secondary-light px-4 py-2 rounded-l-md border-r border-gray-700">
                  Previous
                </button>
                <button className="bg-primary px-4 py-2">1</button>
                <button className="bg-secondary hover:bg-secondary-light px-4 py-2">2</button>
                <button className="bg-secondary hover:bg-secondary-light px-4 py-2">3</button>
                <button className="bg-secondary hover:bg-secondary-light px-4 py-2 rounded-r-md border-l border-gray-700">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default FavoritesPage; 