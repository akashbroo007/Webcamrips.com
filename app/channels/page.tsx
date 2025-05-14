import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { FiSearch, FiVideo, FiUsers, FiCheck } from 'react-icons/fi';

export const metadata = {
  title: 'Channels - WebcamRips',
  description: 'Browse premium webcam channels on WebcamRips',
};

const channelsData = [
  {
    id: 'premium-stars',
    name: 'Premium Stars',
    logo: '/channels/premium-stars.jpg',
    videosCount: 247,
    subscribers: '124K',
    verified: true,
    premium: true,
    description: 'Top-tier webcam performances from the most popular models'
  },
  {
    id: 'exclusive-vip',
    name: 'Exclusive VIP',
    logo: '/channels/exclusive-vip.jpg',
    videosCount: 189,
    subscribers: '98K',
    verified: true,
    premium: true,
    description: 'Members-only content with exclusive performances'
  },
  {
    id: 'amateur-gems',
    name: 'Amateur Gems',
    logo: '/channels/amateur-gems.jpg',
    videosCount: 312,
    subscribers: '156K',
    verified: true,
    premium: false,
    description: 'Authentic amateur webcam sessions with rising stars'
  },
  {
    id: 'cosplay-fantasies',
    name: 'Cosplay Fantasies',
    logo: '/channels/cosplay-fantasies.jpg',
    videosCount: 143,
    subscribers: '87K',
    verified: true,
    premium: false,
    description: 'Costume play and fantasy roleplay webcam shows'
  },
  {
    id: 'fetish-universe',
    name: 'Fetish Universe',
    logo: '/channels/fetish-universe.jpg',
    videosCount: 176,
    subscribers: '93K',
    verified: true,
    premium: true,
    description: 'Specialized fetish content from professional models'
  },
  {
    id: 'couples-paradise',
    name: 'Couples Paradise',
    logo: '/channels/couples-paradise.jpg',
    videosCount: 128,
    subscribers: '105K',
    verified: true,
    premium: false,
    description: 'Intimate sessions featuring real couples'
  },
  {
    id: 'latina-hotties',
    name: 'Latina Hotties',
    logo: '/channels/latina-hotties.jpg',
    videosCount: 167,
    subscribers: '113K',
    verified: true,
    premium: false,
    description: 'The hottest Latina webcam performances'
  },
  {
    id: 'euro-beauties',
    name: 'Euro Beauties',
    logo: '/channels/euro-beauties.jpg',
    videosCount: 192,
    subscribers: '94K',
    verified: true,
    premium: false,
    description: 'Top European models in exclusive webcam sessions'
  }
];

const ChannelsPage = () => {
  return (
    <>
      <Header />
      <main className="bg-secondary min-h-screen py-10">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-8">Channels</h1>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="relative max-w-md w-full">
              <input 
                type="text" 
                placeholder="Search channels..." 
                className="w-full bg-dark rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="absolute left-3 top-3 text-gray-400">
                <FiSearch />
              </span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select className="bg-dark rounded px-4 py-2 text-sm text-white">
                <option>Sort by popularity</option>
                <option>Sort by name</option>
                <option>Sort by videos</option>
              </select>
              
              <button className="bg-primary px-4 py-2 rounded text-sm">
                All Channels
              </button>
              
              <button className="bg-dark px-4 py-2 rounded text-sm text-white">
                Premium
              </button>
            </div>
          </div>
          
          {/* Featured Channels Banner */}
          <div className="bg-gradient-to-r from-purple-900 to-primary rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-2">Featured Channels</h2>
            <p className="text-gray-200 mb-4">Discover our premium content collections curated by top creators</p>
            <Link href="/channels/premium" className="inline-block bg-white text-primary font-bold px-6 py-2 rounded-full hover:bg-gray-100 transition-colors">
              Explore Premium
            </Link>
          </div>
          
          {/* Channels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {channelsData.map((channel) => (
              <Link 
                href={`/channels/${channel.id}`} 
                key={channel.id}
                className="block bg-dark rounded-lg overflow-hidden transition-transform hover:scale-[1.02]"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-40 bg-gray-800 h-40 sm:h-full flex items-center justify-center shrink-0">
                    <span className="text-gray-500">Logo</span>
                  </div>
                  
                  <div className="p-5 flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-white">{channel.name}</h3>
                      <div className="flex items-center">
                        {channel.verified && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center mr-2">
                            <FiCheck className="mr-1" size={12} />
                            <span>Verified</span>
                          </span>
                        )}
                        {channel.premium && (
                          <span className="bg-yellow-500 text-dark text-xs px-2 py-1 rounded-full">
                            Premium
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {channel.description}
                    </p>
                    
                    <div className="flex justify-between mt-auto">
                      <div className="text-gray-400 flex items-center text-sm">
                        <FiVideo className="mr-1" />
                        <span>{channel.videosCount} videos</span>
                      </div>
                      <div className="text-gray-400 flex items-center text-sm">
                        <FiUsers className="mr-1" />
                        <span>{channel.subscribers} subs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="mt-10 flex justify-center">
            <div className="flex space-x-2">
              <button className="px-4 py-2 rounded bg-dark text-gray-400 hover:bg-primary hover:text-white transition-colors">
                Previous
              </button>
              <button className="px-4 py-2 rounded bg-primary text-white">1</button>
              <button className="px-4 py-2 rounded bg-dark text-gray-400 hover:bg-primary hover:text-white transition-colors">
                2
              </button>
              <button className="px-4 py-2 rounded bg-dark text-gray-400 hover:bg-primary hover:text-white transition-colors">
                3
              </button>
              <button className="px-4 py-2 rounded bg-dark text-gray-400 hover:bg-primary hover:text-white transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ChannelsPage; 