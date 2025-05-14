"use client"

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiSearch, FiLoader } from 'react-icons/fi';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VideoGrid from '@/components/video/VideoGrid';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [isSearching, setIsSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);

  // Update search query when URL parameter changes
  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Update URL with search query
    const url = new URL(window.location.href);
    url.searchParams.set('q', searchQuery);
    window.history.pushState({}, '', url.toString());
    
    setIsSearching(true);
    
    // The VideoGrid component will automatically fetch results based on the URL params
    setTimeout(() => {
      setIsSearching(false);
    }, 1000);
  };

  return (
    <>
      <Header />
      <main className="bg-secondary min-h-screen py-10">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-8">Search Results</h1>
          
          {/* Search Form */}
          <div className="bg-dark rounded-lg p-4 mb-8">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FiSearch />
                </span>
                <input
                  type="text"
                  placeholder="Search videos, performers, tags..."
                  className="w-full bg-secondary rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                disabled={isSearching}
              >
                {isSearching ? (
                  <FiLoader className="animate-spin" />
                ) : (
                  'Search'
                )}
              </button>
            </form>
          </div>
          
          {/* Search Results */}
          {query ? (
            <>
              <h2 className="text-xl font-semibold mb-4">Results for "{query}"</h2>
              <VideoGrid 
                title=""
                endpoint={`/api/videos/search`}
                showFilters={false}
                limit={20}
                initialSortBy="newest"
              />
            </>
          ) : (
            <div className="bg-dark rounded-lg p-8 text-center">
              <p className="text-gray-400">Enter a search term above to find videos</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
} 