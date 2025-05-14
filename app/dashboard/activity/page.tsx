"use client"

import { FC, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FiClock, 
  FiChevronLeft, 
  FiCalendar, 
  FiEye, 
  FiHeart, 
  FiMessageSquare,
  FiUpload,
  FiUserPlus,
  FiDownload,
  FiFilter,
  FiTrash2,
  FiSearch
} from 'react-icons/fi';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Mock activity data
const activityData = [
  {
    id: 1,
    type: 'view',
    title: 'Watched "Sunset_angel live show highlights"',
    thumbnail: '/images/thumb1.jpg',
    date: '2023-12-21T15:32:00',
    videoId: 101,
    platform: 'Chaturbate'
  },
  {
    id: 2,
    type: 'favorite',
    title: 'Added "Midnight_lotus exclusive content" to favorites',
    thumbnail: '/images/thumb5.jpg',
    date: '2023-12-20T19:45:00',
    videoId: 105,
    platform: 'LiveJasmin'
  },
  {
    id: 3,
    type: 'upload',
    title: 'Uploaded "Fantasy_lilly full webcam show"',
    thumbnail: '/images/thumb3.jpg',
    date: '2023-12-19T11:20:00',
    videoId: 103,
    platform: 'Stripchat'
  },
  {
    id: 4,
    type: 'view',
    title: 'Watched "Wild_rose private session"',
    thumbnail: '/images/thumb4.jpg',
    date: '2023-12-18T21:15:00',
    videoId: 104,
    platform: 'BongaCams'
  },
  {
    id: 5,
    type: 'comment',
    title: 'Commented on "Crystal_beauty live stream highlights"',
    thumbnail: '/images/thumb3.jpg',
    date: '2023-12-17T16:30:00',
    videoId: 106,
    platform: 'Chaturbate',
    comment: 'Amazing stream, loved the music selection!'
  },
  {
    id: 6,
    type: 'view',
    title: 'Watched "Blueeyed_dream premium stream"',
    thumbnail: '/images/thumb2.jpg',
    date: '2023-12-16T20:10:00',
    videoId: 102,
    platform: 'Camsoda'
  },
  {
    id: 7,
    type: 'download',
    title: 'Downloaded "Star_gaze premium archive show"',
    thumbnail: '/images/thumb6.jpg',
    date: '2023-12-15T14:25:00',
    videoId: 107,
    platform: 'MyFreeCams'
  },
  {
    id: 8,
    type: 'account',
    title: 'Updated profile information',
    date: '2023-12-14T09:55:00',
  },
  {
    id: 9,
    type: 'account',
    title: 'Subscribed to Premium plan',
    date: '2023-12-13T10:30:00',
  },
  {
    id: 10,
    type: 'view',
    title: 'Watched "Lucy_star premium content"',
    thumbnail: '/images/thumb1.jpg',
    date: '2023-12-12T22:40:00',
    videoId: 108,
    platform: 'Chaturbate'
  }
];

// Activity type icons
const activityIcons = {
  view: <FiEye className="text-blue-400" />,
  favorite: <FiHeart className="text-red-400" />,
  comment: <FiMessageSquare className="text-green-400" />,
  upload: <FiUpload className="text-purple-400" />,
  account: <FiUserPlus className="text-yellow-400" />,
  download: <FiDownload className="text-cyan-400" />
};

const ActivityPage: FC = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter activities
  const filteredActivities = activityData.filter(activity => {
    // Apply type filter
    if (filter !== 'all' && activity.type !== filter) {
      return false;
    }
    
    // Apply search term
    if (searchTerm && !activity.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  return (
    <>
      <Header />
      <main className="bg-dark min-h-screen py-8">
        <div className="container-custom">
          {/* Back to Dashboard link */}
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-primary hover:underline mb-6"
          >
            <FiChevronLeft className="mr-1" /> Back to Dashboard
          </Link>
          
          <div className="bg-secondary rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="bg-secondary-light p-6 border-b border-gray-700">
              <h1 className="text-2xl font-bold flex items-center">
                <FiClock className="mr-2" /> Activity Log
              </h1>
            </div>
            
            {/* Filters and Search */}
            <div className="p-4 bg-secondary-light bg-opacity-50 border-b border-gray-700">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSearch className="text-gray-500" />
                    </div>
                    <input
                      type="search"
                      className="w-full pl-10 pr-4 py-2 bg-dark border border-gray-700 rounded-md focus:border-primary focus:ring-1 focus:ring-primary text-white"
                      placeholder="Search activity..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-between md:w-auto">
                  <select
                    className="bg-dark border border-gray-700 rounded-md px-3 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary mr-2"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">All Activity</option>
                    <option value="view">Views</option>
                    <option value="favorite">Favorites</option>
                    <option value="comment">Comments</option>
                    <option value="upload">Uploads</option>
                    <option value="download">Downloads</option>
                    <option value="account">Account</option>
                  </select>
                  <button 
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm flex items-center"
                    onClick={() => {
                      if (confirm('Are you sure you want to clear your activity history?')) {
                        alert('Activity history cleared');
                      }
                    }}
                  >
                    <FiTrash2 className="mr-1" /> Clear
                  </button>
                </div>
              </div>
            </div>
            
            {/* Activity List */}
            <div className="divide-y divide-gray-700">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-secondary-light transition-colors">
                    <div className="flex items-start">
                      <div className="rounded-full bg-dark p-2 mr-3">
                        {activityIcons[activity.type as keyof typeof activityIcons]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-white">{activity.title}</h3>
                            {activity.comment && (
                              <p className="text-gray-400 text-sm mt-1 pl-3 border-l-2 border-gray-700">
                                "{activity.comment}"
                              </p>
                            )}
                            <div className="text-sm text-gray-400 mt-1 flex items-center">
                              <FiCalendar className="mr-1" /> 
                              {new Date(activity.date).toLocaleString()}
                              {activity.platform && (
                                <>
                                  <span className="mx-2">•</span>
                                  {activity.platform}
                                </>
                              )}
                            </div>
                          </div>
                          {activity.thumbnail && (
                            <Link href={`/video/${activity.videoId}`} className="ml-4 flex-shrink-0">
                              <div className="relative w-20 h-12 rounded-md overflow-hidden">
                                <Image
                                  src={activity.thumbnail}
                                  alt={activity.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="text-gray-500 mb-2">
                    <FiClock size={40} className="mx-auto mb-2" />
                    <h3 className="text-xl font-medium">No activities found</h3>
                  </div>
                  <p className="text-gray-400">
                    {searchTerm || filter !== 'all' ? 
                      'Try changing your filters or search term' : 
                      'Your activity history will appear here'}
                  </p>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {filteredActivities.length > 0 && (
              <div className="p-4 border-t border-gray-700 flex justify-center">
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
          
          {/* Activity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-secondary rounded-lg p-4 flex items-center">
              <div className="rounded-full bg-blue-900 bg-opacity-50 p-3 mr-3">
                <FiEye className="text-blue-300" />
              </div>
              <div>
                <h3 className="text-sm text-gray-400">Videos Watched</h3>
                <div className="text-2xl font-bold">128</div>
              </div>
            </div>
            <div className="bg-secondary rounded-lg p-4 flex items-center">
              <div className="rounded-full bg-red-900 bg-opacity-50 p-3 mr-3">
                <FiHeart className="text-red-300" />
              </div>
              <div>
                <h3 className="text-sm text-gray-400">Favorites Added</h3>
                <div className="text-2xl font-bold">48</div>
              </div>
            </div>
            <div className="bg-secondary rounded-lg p-4 flex items-center">
              <div className="rounded-full bg-purple-900 bg-opacity-50 p-3 mr-3">
                <FiUpload className="text-purple-300" />
              </div>
              <div>
                <h3 className="text-sm text-gray-400">Videos Uploaded</h3>
                <div className="text-2xl font-bold">12</div>
              </div>
            </div>
            <div className="bg-secondary rounded-lg p-4 flex items-center">
              <div className="rounded-full bg-cyan-900 bg-opacity-50 p-3 mr-3">
                <FiDownload className="text-cyan-300" />
              </div>
              <div>
                <h3 className="text-sm text-gray-400">Downloads</h3>
                <div className="text-2xl font-bold">36</div>
              </div>
            </div>
          </div>
          
          {/* Privacy Notice */}
          <div className="bg-secondary rounded-lg p-4">
            <h3 className="font-medium mb-2">Privacy Settings</h3>
            <p className="text-gray-400 text-sm mb-3">
              Your activity data is stored according to our privacy policy. You can manage or delete your activity history at any time.
            </p>
            <div className="flex space-x-3">
              <Link 
                href="/dashboard/settings/privacy" 
                className="text-primary hover:underline text-sm inline-flex items-center"
              >
                Manage Privacy Settings
              </Link>
              <button 
                className="text-red-500 hover:underline text-sm inline-flex items-center"
                onClick={() => {
                  if (confirm('Are you sure you want to clear all your activity history? This cannot be undone.')) {
                    alert('All activity history has been cleared');
                  }
                }}
              >
                <FiTrash2 className="mr-1" /> Delete All Activity
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ActivityPage; 