import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { FiSearch, FiVideo, FiStar, FiHeart } from 'react-icons/fi';

export const metadata = {
  title: 'Models - WebcamRips',
  description: 'Browse all webcam models on WebcamRips',
};

const modelsData = [
  { 
    id: 'alexastar', 
    name: 'AlexaStar', 
    photo: '/models/alexastar.jpg',
    videosCount: 87,
    likes: '42K',
    rating: 4.8,
    featured: true,
    verified: true
  },
  { 
    id: 'juicylucy', 
    name: 'JuicyLucy', 
    photo: '/models/juicylucy.jpg',
    videosCount: 65,
    likes: '38K',
    rating: 4.7,
    featured: true,
    verified: true
  },
  { 
    id: 'sophiesweet', 
    name: 'SophieSweet', 
    photo: '/models/sophiesweet.jpg',
    videosCount: 73,
    likes: '51K',
    rating: 4.9,
    featured: true,
    verified: true
  },
  { 
    id: 'candydoll', 
    name: 'CandyDoll', 
    photo: '/models/candydoll.jpg',
    videosCount: 59,
    likes: '33K',
    rating: 4.6,
    featured: false,
    verified: true
  },
  { 
    id: 'jessicahot', 
    name: 'JessicaHot', 
    photo: '/models/jessicahot.jpg',
    videosCount: 94,
    likes: '47K',
    rating: 4.8,
    featured: true,
    verified: true
  },
  { 
    id: 'amberrose', 
    name: 'AmberRose', 
    photo: '/models/amberrose.jpg',
    videosCount: 68,
    likes: '36K',
    rating: 4.7,
    featured: false,
    verified: true
  },
  { 
    id: 'misskitty', 
    name: 'MissKitty', 
    photo: '/models/misskitty.jpg',
    videosCount: 51,
    likes: '29K',
    rating: 4.5,
    featured: false,
    verified: true
  },
  { 
    id: 'lilypink', 
    name: 'LilyPink', 
    photo: '/models/lilypink.jpg',
    videosCount: 82,
    likes: '44K',
    rating: 4.8,
    featured: true,
    verified: true
  },
  { 
    id: 'rosered', 
    name: 'RoseRed', 
    photo: '/models/rosered.jpg',
    videosCount: 45,
    likes: '31K',
    rating: 4.6,
    featured: false,
    verified: true
  },
  { 
    id: 'bluediamond', 
    name: 'BlueDiamond', 
    photo: '/models/bluediamond.jpg',
    videosCount: 76,
    likes: '40K',
    rating: 4.7,
    featured: false,
    verified: true
  },
  { 
    id: 'goldenhoney', 
    name: 'GoldenHoney', 
    photo: '/models/goldenhoney.jpg',
    videosCount: 63,
    likes: '35K',
    rating: 4.5,
    featured: false,
    verified: true
  },
  { 
    id: 'silverangel', 
    name: 'SilverAngel', 
    photo: '/models/silverangel.jpg',
    videosCount: 57,
    likes: '32K',
    rating: 4.6,
    featured: false,
    verified: true
  }
];

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const ModelsPage = () => {
  return (
    <>
      <Header />
      <main className="bg-secondary min-h-screen py-10">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-8">Models</h1>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="relative max-w-md w-full">
              <input 
                type="text" 
                placeholder="Search models..." 
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
                <option>Sort by rating</option>
                <option>Sort by videos</option>
              </select>
              
              <button className="bg-primary px-4 py-2 rounded text-sm">
                Featured
              </button>
              
              <button className="bg-dark px-4 py-2 rounded text-sm text-white">
                Verified
              </button>
            </div>
          </div>
          
          {/* Alphabetical Navigation */}
          <div className="bg-dark rounded-lg p-4 mb-8 overflow-x-auto">
            <div className="flex min-w-max">
              <button className="px-3 py-1 text-white font-bold hover:text-primary">
                All
              </button>
              {alphabet.map(letter => (
                <button 
                  key={letter} 
                  className="px-3 py-1 text-white hover:text-primary"
                >
                  {letter}
                </button>
              ))}
              <button className="px-3 py-1 text-white hover:text-primary">
                0-9
              </button>
            </div>
          </div>
          
          {/* Models Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {modelsData.map((model) => (
              <Link 
                href={`/models/${model.id}`} 
                key={model.id}
                className="block bg-dark rounded-lg overflow-hidden transition-transform hover:scale-105"
              >
                <div className="relative">
                  <div className="bg-gray-800 h-48 w-full flex items-center justify-center">
                    <span className="text-gray-500">Photo</span>
                  </div>
                  {model.featured && (
                    <span className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                  {model.verified && (
                    <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                      <FiStar className="mr-1" size={12} /> Verified
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-medium text-white">{model.name}</h3>
                  
                  <div className="mt-2 flex justify-between items-center text-sm">
                    <div className="text-gray-400 flex items-center">
                      <FiVideo className="mr-1" size={14} />
                      <span>{model.videosCount} videos</span>
                    </div>
                    <div className="text-gray-400 flex items-center">
                      <FiHeart className="mr-1" size={14} />
                      <span>{model.likes}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.floor(model.rating) ? "text-yellow-400" : "text-gray-600"}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-400">{model.rating}</span>
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

export default ModelsPage; 