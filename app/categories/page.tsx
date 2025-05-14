import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { FiVideo } from 'react-icons/fi';

export const metadata = {
  title: 'Categories - WebcamRips',
  description: 'Browse videos by category on WebcamRips',
};

const categoriesData = [
  { id: 'solo', name: 'Solo', count: 1245, icon: '👩‍🦰', color: 'bg-pink-600' },
  { id: 'dance', name: 'Dance', count: 879, icon: '💃', color: 'bg-purple-600' },
  { id: 'cosplay', name: 'Cosplay', count: 562, icon: '👗', color: 'bg-blue-600' },
  { id: 'private', name: 'Private', count: 983, icon: '🔒', color: 'bg-red-600' },
  { id: 'vip', name: 'VIP', count: 721, icon: '⭐', color: 'bg-yellow-600' },
  { id: 'special', name: 'Special', count: 437, icon: '🎁', color: 'bg-green-600' },
  { id: 'shower', name: 'Shower', count: 320, icon: '🚿', color: 'bg-blue-400' },
  { id: 'bedroom', name: 'Bedroom', count: 645, icon: '🛏️', color: 'bg-purple-400' },
  { id: 'outdoors', name: 'Outdoors', count: 189, icon: '🌳', color: 'bg-green-500' },
  { id: 'roleplay', name: 'Role Play', count: 275, icon: '🎭', color: 'bg-indigo-600' },
  { id: 'toys', name: 'Toys', count: 523, icon: '🧸', color: 'bg-pink-500' },
  { id: 'asmr', name: 'ASMR', count: 142, icon: '🎧', color: 'bg-violet-600' },
  { id: 'couples', name: 'Couples', count: 389, icon: '👩‍❤️‍👨', color: 'bg-red-500' },
  { id: 'threesome', name: 'Threesome', count: 211, icon: '👩‍❤️‍👩', color: 'bg-orange-600' },
  { id: 'latex', name: 'Latex', count: 95, icon: '⚫', color: 'bg-gray-800' },
  { id: 'school', name: 'School', count: 158, icon: '🏫', color: 'bg-blue-500' },
  { id: 'nurse', name: 'Nurse', count: 126, icon: '👩‍⚕️', color: 'bg-red-400' },
  { id: 'office', name: 'Office', count: 184, icon: '👔', color: 'bg-gray-600' },
  { id: 'gym', name: 'Gym', count: 203, icon: '💪', color: 'bg-green-600' },
  { id: 'bikini', name: 'Bikini', count: 317, icon: '👙', color: 'bg-cyan-500' }
];

const CategoriesPage = () => {
  return (
    <>
      <Header />
      <main className="bg-secondary min-h-screen py-10">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-8">Video Categories</h1>
          
          {/* Search Box */}
          <div className="mb-8">
            <div className="relative max-w-md mx-auto md:mx-0">
              <input 
                type="text" 
                placeholder="Search categories..." 
                className="w-full bg-dark rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="absolute left-3 top-3 text-gray-400">
                <FiVideo />
              </span>
            </div>
          </div>
          
          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categoriesData.map((category) => (
              <Link 
                href={`/categories/${category.id}`} 
                key={category.id}
                className="block bg-dark rounded-lg overflow-hidden transition-transform hover:scale-105"
              >
                <div className={`py-4 ${category.color}`}>
                  <div className="text-center text-4xl">
                    {category.icon}
                  </div>
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-xl font-medium text-white">{category.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{category.count} videos</p>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Popular Tags Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Popular Tags</h2>
            <div className="flex flex-wrap gap-3">
              {['amateur', 'blonde', 'brunette', 'redhead', 'ebony', 'asian', 'latina', 'teen', 'milf', 'bbw', 'petite', 'tattoo', 'piercing', 'webcam', 'hd', 'exclusive', 'verified', 'trending'].map((tag) => (
                <Link 
                  href={`/tags/${tag}`} 
                  key={tag}
                  className="bg-dark px-3 py-1 rounded-full text-sm text-gray-300 hover:bg-primary hover:text-white transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CategoriesPage; 