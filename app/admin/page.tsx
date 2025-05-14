"use client"

import React, { FC, useEffect, useState } from 'react';
import Link from 'next/link';
import { FiUsers, FiVideo, FiFlag, FiActivity, FiDollarSign, FiSettings, FiPieChart, FiCalendar } from 'react-icons/fi';
import Header from '@/components/layout/Header';

// Stats data structure
interface StatsItem {
  title: string;
  value: string;
  icon: any;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}

// User data structure
interface User {
  id: string;
  username: string;
  email: string;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
}

// Video data structure
interface Video {
  id: string;
  title: string;
  uploader: string;
  platform: string;
  createdAt: string;
}

const AdminDashboardPage: FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [stats, setStats] = useState<StatsItem[]>([
    { title: 'Total Users', value: '0', icon: FiUsers, change: '0%', changeType: 'neutral' },
    { title: 'Total Videos', value: '0', icon: FiVideo, change: '0%', changeType: 'neutral' },
    { title: 'Reported Content', value: '0', icon: FiFlag, change: '0%', changeType: 'neutral' },
    { title: 'Active Sessions', value: '0', icon: FiActivity, change: '0%', changeType: 'neutral' },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch users and videos from API
    const fetchData = async () => {
      try {
        // Fetch users
        const usersResponse = await fetch('/api/admin/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
          
          // Update stats with user count
          setStats(prevStats => {
            const userStat = prevStats.find(s => s.title === 'Total Users');
            if (userStat) {
              userStat.value = usersData.length.toString();
            }
            return [...prevStats];
          });
        }

        // Fetch videos
        const videosResponse = await fetch('/api/admin/videos');
        if (videosResponse.ok) {
          const videosData = await videosResponse.json();
          setVideos(videosData);
          
          // Update stats with video count
          setStats(prevStats => {
            const videoStat = prevStats.find(s => s.title === 'Total Videos');
            if (videoStat) {
              videoStat.value = videosData.length.toString();
            }
            return [...prevStats];
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Header />
      <div className="bg-dark min-h-screen text-white pb-8">
        <div className="container-custom pt-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="flex space-x-3">
              <Link href="/admin/recordings" className="btn-primary flex items-center">
                <FiVideo className="mr-2" />
                Manage Recordings
              </Link>
              <Link href="/admin/settings" className="btn-secondary flex items-center">
                <FiSettings className="mr-2" />
                Settings
              </Link>
              <button className="btn-secondary flex items-center">
                <FiPieChart className="mr-2" />
                Generate Report
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-secondary rounded-lg p-6 shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 mb-1">{stat.title}</p>
                    <h3 className="text-3xl font-bold">{stat.value}</h3>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-full">
                    <stat.icon size={24} className="text-primary" />
                  </div>
                </div>
                <div className={`mt-4 text-sm ${
                  stat.changeType === 'positive' ? 'text-green-500' : 
                  stat.changeType === 'negative' ? 'text-red-500' : 'text-gray-400'
                }`}>
                  {stat.change} from last month
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-secondary rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FiCalendar className="mr-2" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {users.length > 0 ? (
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <p className="text-sm text-gray-300">New user registered <span className="text-gray-400">recently</span></p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No recent user registrations</p>
                )}
                
                {videos.length > 0 ? (
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                    <p className="text-sm text-gray-300">New video uploaded <span className="text-gray-400">recently</span></p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No recent video uploads</p>
                )}
                
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                  <p className="text-sm text-gray-300">Server maintenance completed <span className="text-gray-400">1 hour ago</span></p>
                </div>
              </div>
              <button className="text-primary text-sm mt-4 hover:underline">View all activity</button>
            </div>
            
            <div className="bg-secondary rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Platform Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Chaturbate</span>
                    <span className="text-gray-400">35%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Stripchat</span>
                    <span className="text-gray-400">28%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">BongaCams</span>
                    <span className="text-gray-400">18%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '18%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Camsoda</span>
                    <span className="text-gray-400">12%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '12%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Others</span>
                    <span className="text-gray-400">7%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '7%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-secondary rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FiDollarSign className="mr-2" />
                Revenue Overview
              </h3>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-gray-300">This Month</h4>
                  <span className="text-green-500">+12.5%</span>
                </div>
                <div className="text-3xl font-bold">$0.00</div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Premium Subscriptions</span>
                  <span className="text-white">$0.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">One-time Purchases</span>
                  <span className="text-white">$0.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Donations</span>
                  <span className="text-white">$0.00</span>
                </div>
              </div>
              <Link href="/admin/finance" className="btn-primary text-sm mt-6 block text-center">
                View Detailed Report
              </Link>
            </div>
          </div>

          {/* Tables Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Users */}
            <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <h3 className="text-xl font-bold">Recent Users</h3>
              </div>
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="p-6 text-center text-gray-500">Loading users...</div>
                ) : users.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Username</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="py-3 px-6 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {users.map((user: User) => (
                        <tr key={user.id} className="hover:bg-gray-800">
                          <td className="py-4 px-6 whitespace-nowrap">{user.username}</td>
                          <td className="py-4 px-6 whitespace-nowrap">{user.email}</td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${user.status === 'active' ? 'bg-green-800 text-green-100' : 
                                user.status === 'pending' ? 'bg-yellow-800 text-yellow-100' : 
                                'bg-red-800 text-red-100'}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 px-6 text-right">
                            <Link href={`/admin/users/${user.id}`} className="text-primary hover:underline">View</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-gray-500">No users found. Register a new user to see them here.</div>
                )}
              </div>
              <div className="p-3 border-t border-gray-800 text-right">
                <Link href="/admin/users" className="text-primary hover:underline text-sm">
                  View All Users
                </Link>
              </div>
            </div>

            {/* Pending Videos */}
            <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <h3 className="text-xl font-bold">Pending Videos</h3>
              </div>
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="p-6 text-center text-gray-500">Loading videos...</div>
                ) : videos.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Uploader</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Platform</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="py-3 px-6 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {videos.map((video: Video) => (
                        <tr key={video.id} className="hover:bg-gray-800">
                          <td className="py-4 px-6 whitespace-nowrap">{video.title}</td>
                          <td className="py-4 px-6 whitespace-nowrap">{video.uploader}</td>
                          <td className="py-4 px-6 whitespace-nowrap">{video.platform}</td>
                          <td className="py-4 px-6 whitespace-nowrap">{new Date(video.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 px-6 text-right space-x-2">
                            <Link href={`/admin/videos/${video.id}`} className="text-primary hover:underline">View</Link>
                            <span className="text-gray-500">|</span>
                            <button className="text-green-500 hover:underline">Approve</button>
                            <span className="text-gray-500">|</span>
                            <button className="text-red-500 hover:underline">Reject</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-gray-500">No pending videos found. Upload a video to see it here.</div>
                )}
              </div>
              <div className="p-3 border-t border-gray-800 text-right">
                <Link href="/admin/videos" className="text-primary hover:underline text-sm">
                  View All Videos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage; 