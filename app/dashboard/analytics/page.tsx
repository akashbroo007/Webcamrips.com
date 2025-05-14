"use client"

import { FC, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FiBarChart2, 
  FiChevronLeft, 
  FiEye, 
  FiClock, 
  FiUsers, 
  FiTrendingUp,
  FiCalendar,
  FiFilter,
  FiDownload,
  FiHeart,
  FiMessageSquare
} from 'react-icons/fi';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Mock performance data
const overallStats = {
  views: {
    total: 24321,
    change: 12.8,
    period: 'last month'
  },
  uniqueViewers: {
    total: 9845,
    change: 8.3,
    period: 'last month'
  },
  watchTime: {
    total: '504:16:42',
    average: '8:24',
    change: 15.2,
    period: 'last month'
  },
  engagement: {
    rate: 6.7,
    likes: 1243,
    comments: 287,
    change: 3.5,
    period: 'last month'
  }
};

// Mock videos performance data
const videoPerformance = [
  {
    id: 1,
    title: 'Sunset_angel live show highlights',
    thumbnail: '/images/thumb1.jpg',
    views: 5432,
    viewsChange: 12.3,
    watchTime: '12:05',
    likes: 321,
    comments: 48,
    date: '2023-12-15',
    platform: 'Chaturbate'
  },
  {
    id: 2,
    title: 'Blueeyed_dream premium stream',
    thumbnail: '/images/thumb2.jpg',
    views: 3211,
    viewsChange: 5.7,
    watchTime: '10:42',
    likes: 186,
    comments: 27,
    date: '2023-12-14',
    platform: 'Camsoda'
  },
  {
    id: 3,
    title: 'Fantasy_lilly full webcam show',
    thumbnail: '/images/thumb3.jpg',
    views: 8765,
    viewsChange: 24.1,
    watchTime: '15:36',
    likes: 524,
    comments: 93,
    date: '2023-12-13',
    platform: 'Stripchat'
  },
  {
    id: 4,
    title: 'Wild_rose private session',
    thumbnail: '/images/thumb4.jpg',
    views: 1234,
    viewsChange: -3.2,
    watchTime: '5:18',
    likes: 75,
    comments: 12,
    date: '2023-12-12',
    platform: 'BongaCams'
  },
  {
    id: 5,
    title: 'Midnight_lotus exclusive content',
    thumbnail: '/images/thumb5.jpg',
    views: 6543,
    viewsChange: 15.8,
    watchTime: '13:25',
    likes: 354,
    comments: 62,
    date: '2023-12-11',
    platform: 'LiveJasmin'
  }
];

// Mock platform data
const platformData = [
  { name: 'Chaturbate', percentage: 38, videos: 38 },
  { name: 'Stripchat', percentage: 27, videos: 27 },
  { name: 'BongaCams', percentage: 18, videos: 18 },
  { name: 'LiveJasmin', percentage: 17, videos: 17 }
];

// Mock audience data
const audienceData = {
  topCountries: [
    { country: 'United States', percentage: 32 },
    { country: 'United Kingdom', percentage: 18 },
    { country: 'Germany', percentage: 12 },
    { country: 'Canada', percentage: 8 },
    { country: 'France', percentage: 6 }
  ],
  devices: [
    { name: 'Desktop', percentage: 52 },
    { name: 'Mobile', percentage: 38 },
    { name: 'Tablet', percentage: 10 }
  ],
  retention: {
    averageViewDuration: '8:24',
    completionRate: 67,
    returnRate: 42
  }
};

const AnalyticsPage: FC = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [sortBy, setSortBy] = useState('views');
  
  // Sort videos based on selected criteria
  const sortedVideos = [...videoPerformance].sort((a, b) => {
    switch (sortBy) {
      case 'views':
        return b.views - a.views;
      case 'date':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'engagement':
        const aEngagement = (a.likes + a.comments) / a.views * 100;
        const bEngagement = (b.likes + b.comments) / b.views * 100;
        return bEngagement - aEngagement;
      case 'watchTime':
        const aMinutes = parseInt(a.watchTime.split(':')[0]) * 60 + parseInt(a.watchTime.split(':')[1]);
        const bMinutes = parseInt(b.watchTime.split(':')[0]) * 60 + parseInt(b.watchTime.split(':')[1]);
        return bMinutes - aMinutes;
      default:
        return 0;
    }
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
          
          <div className="mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
              <h1 className="text-3xl font-bold flex items-center">
                <FiBarChart2 className="mr-2" /> Analytics & Insights
              </h1>
              
              {/* Date Range Selector */}
              <div className="flex space-x-2 mt-4 md:mt-0">
                <button 
                  onClick={() => setDateRange('7d')}
                  className={`px-3 py-2 rounded-md text-sm ${
                    dateRange === '7d' ? 'bg-primary text-white' : 'bg-secondary text-gray-300'
                  }`}
                >
                  7 Days
                </button>
                <button 
                  onClick={() => setDateRange('30d')}
                  className={`px-3 py-2 rounded-md text-sm ${
                    dateRange === '30d' ? 'bg-primary text-white' : 'bg-secondary text-gray-300'
                  }`}
                >
                  30 Days
                </button>
                <button 
                  onClick={() => setDateRange('90d')}
                  className={`px-3 py-2 rounded-md text-sm ${
                    dateRange === '90d' ? 'bg-primary text-white' : 'bg-secondary text-gray-300'
                  }`}
                >
                  90 Days
                </button>
                <button 
                  onClick={() => setDateRange('all')}
                  className={`px-3 py-2 rounded-md text-sm ${
                    dateRange === 'all' ? 'bg-primary text-white' : 'bg-secondary text-gray-300'
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>
            
            <p className="text-gray-400">
              Performance overview for the last {dateRange === '7d' ? '7 days' : 
                                                dateRange === '30d' ? '30 days' : 
                                                dateRange === '90d' ? '90 days' : 'all time'}
            </p>
          </div>
          
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Views Card */}
            <div className="bg-secondary rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-900 bg-opacity-50 p-2 mr-3">
                    <FiEye className="text-blue-300" />
                  </div>
                  <h3 className="font-medium">Total Views</h3>
                </div>
                <span className={`text-sm px-2 py-1 rounded-full flex items-center ${
                  overallStats.views.change >= 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                }`}>
                  {overallStats.views.change >= 0 ? '+' : ''}{overallStats.views.change}%
                </span>
              </div>
              <div className="text-3xl font-bold mb-2">
                {overallStats.views.total.toLocaleString()}
              </div>
              <p className="text-gray-400 text-sm">
                Compared to {overallStats.views.period}
              </p>
            </div>
            
            {/* Unique Viewers Card */}
            <div className="bg-secondary rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="rounded-full bg-purple-900 bg-opacity-50 p-2 mr-3">
                    <FiUsers className="text-purple-300" />
                  </div>
                  <h3 className="font-medium">Unique Viewers</h3>
                </div>
                <span className={`text-sm px-2 py-1 rounded-full flex items-center ${
                  overallStats.uniqueViewers.change >= 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                }`}>
                  {overallStats.uniqueViewers.change >= 0 ? '+' : ''}{overallStats.uniqueViewers.change}%
                </span>
              </div>
              <div className="text-3xl font-bold mb-2">
                {overallStats.uniqueViewers.total.toLocaleString()}
              </div>
              <p className="text-gray-400 text-sm">
                Compared to {overallStats.uniqueViewers.period}
              </p>
            </div>
            
            {/* Watch Time Card */}
            <div className="bg-secondary rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="rounded-full bg-green-900 bg-opacity-50 p-2 mr-3">
                    <FiClock className="text-green-300" />
                  </div>
                  <h3 className="font-medium">Avg. Watch Time</h3>
                </div>
                <span className={`text-sm px-2 py-1 rounded-full flex items-center ${
                  overallStats.watchTime.change >= 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                }`}>
                  {overallStats.watchTime.change >= 0 ? '+' : ''}{overallStats.watchTime.change}%
                </span>
              </div>
              <div className="text-3xl font-bold mb-2">
                {overallStats.watchTime.average}
              </div>
              <p className="text-gray-400 text-sm">
                Total: {overallStats.watchTime.total} hours
              </p>
            </div>
            
            {/* Engagement Rate Card */}
            <div className="bg-secondary rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="rounded-full bg-red-900 bg-opacity-50 p-2 mr-3">
                    <FiTrendingUp className="text-red-300" />
                  </div>
                  <h3 className="font-medium">Engagement Rate</h3>
                </div>
                <span className={`text-sm px-2 py-1 rounded-full flex items-center ${
                  overallStats.engagement.change >= 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                }`}>
                  {overallStats.engagement.change >= 0 ? '+' : ''}{overallStats.engagement.change}%
                </span>
              </div>
              <div className="text-3xl font-bold mb-2">
                {overallStats.engagement.rate}%
              </div>
              <p className="text-gray-400 text-sm">
                {overallStats.engagement.likes} likes, {overallStats.engagement.comments} comments
              </p>
            </div>
          </div>
          
          {/* Video Performance Table */}
          <div className="bg-secondary rounded-lg shadow-lg mb-8 overflow-hidden">
            <div className="bg-secondary-light p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">Video Performance</h2>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-400 mr-2">Sort by:</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-dark border border-gray-700 rounded-md px-3 py-1 text-sm text-white"
                >
                  <option value="views">Views</option>
                  <option value="engagement">Engagement</option>
                  <option value="watchTime">Watch Time</option>
                  <option value="date">Recent</option>
                </select>
                
                <button className="bg-primary text-white p-2 rounded-md">
                  <FiDownload size={16} />
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-dark bg-opacity-50">
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Video</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Views</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Avg. Watch Time</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Engagement</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Platform</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Published</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedVideos.map((video) => (
                    <tr key={video.id} className="border-b border-gray-700 hover:bg-secondary-light transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="relative w-16 h-10 rounded overflow-hidden mr-3">
                            <Image 
                              src={video.thumbnail}
                              alt={video.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="truncate max-w-[200px]">{video.title}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="mr-2">{video.views.toLocaleString()}</span>
                          <span className={`text-xs px-1 py-0.5 rounded ${
                            video.viewsChange >= 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                          }`}>
                            {video.viewsChange >= 0 ? '+' : ''}{video.viewsChange}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{video.watchTime}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <FiHeart className="text-red-400 mr-1" size={14} />
                            <span>{video.likes}</span>
                          </div>
                          <div className="flex items-center">
                            <FiMessageSquare className="text-blue-400 mr-1" size={14} />
                            <span>{video.comments}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{video.platform}</td>
                      <td className="py-3 px-4 text-gray-400">
                        <div className="flex items-center">
                          <FiCalendar className="mr-1" size={14} />
                          <span>{new Date(video.date).toLocaleDateString()}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-gray-700 flex justify-between items-center">
              <div className="text-sm text-gray-400">Showing {sortedVideos.length} of {sortedVideos.length} videos</div>
              <Link href="/dashboard/analytics/videos" className="text-primary hover:underline text-sm flex items-center">
                View All Videos <FiChevronLeft className="ml-1 transform rotate-180" />
              </Link>
            </div>
          </div>
          
          {/* Additional Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Platform Distribution */}
            <div className="bg-secondary rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Platform Distribution</h2>
              <div className="space-y-4">
                {platformData.map((platform) => (
                  <div key={platform.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span>{platform.name}</span>
                      <span className="text-gray-400">{platform.videos} videos</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          platform.name === 'Chaturbate' ? 'bg-purple-500' :
                          platform.name === 'Stripchat' ? 'bg-pink-500' :
                          platform.name === 'BongaCams' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`} 
                        style={{ width: `${platform.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Audience Demographics */}
            <div className="bg-secondary rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Top Audience Countries</h2>
              <div className="space-y-4">
                {audienceData.topCountries.map((country) => (
                  <div key={country.country}>
                    <div className="flex justify-between items-center mb-1">
                      <span>{country.country}</span>
                      <span className="text-gray-400">{country.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-green-500 h-2.5 rounded-full" 
                        style={{ width: `${country.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Audience Retention */}
            <div className="bg-secondary rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Audience Engagement</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Average View Duration</span>
                    <span className="font-medium">{audienceData.retention.averageViewDuration}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-cyan-500 h-2.5 rounded-full" 
                      style={{ width: `${audienceData.retention.completionRate}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Video Completion Rate</span>
                    <span className="font-medium">{audienceData.retention.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-orange-500 h-2.5 rounded-full" 
                      style={{ width: `${audienceData.retention.completionRate}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Return Viewer Rate</span>
                    <span className="font-medium">{audienceData.retention.returnRate}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-yellow-500 h-2.5 rounded-full" 
                      style={{ width: `${audienceData.retention.returnRate}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Device Breakdown</h3>
                  <div className="flex">
                    {audienceData.devices.map((device, index) => (
                      <div 
                        key={device.name}
                        className="h-4 first:rounded-l-full last:rounded-r-full"
                        style={{ 
                          width: `${device.percentage}%`,
                          backgroundColor: index === 0 ? '#4c1d95' : index === 1 ? '#6d28d9' : '#8b5cf6'
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex mt-2 text-xs justify-between">
                    {audienceData.devices.map((device) => (
                      <div key={device.name} className="flex items-center">
                        <div 
                          className="w-2 h-2 rounded-full mr-1"
                          style={{ 
                            backgroundColor: device.name === 'Desktop' ? '#4c1d95' : 
                                             device.name === 'Mobile' ? '#6d28d9' : '#8b5cf6'
                          }}
                        />
                        <span>{device.name}: {device.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Download Report Button */}
          <div className="flex justify-center">
            <button className="btn-primary flex items-center">
              <FiDownload className="mr-2" /> Download Analytics Report
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AnalyticsPage; 