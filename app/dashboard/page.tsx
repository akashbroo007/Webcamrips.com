"use client"

import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { FiUpload, FiHeart, FiSettings, FiUser, FiCreditCard, FiClock, FiEye, FiList, FiBarChart2 } from 'react-icons/fi';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VideoCard from '@/components/video/VideoCard';
import VideoGrid from '@/components/video/VideoGrid';

interface UserData {
  id?: string;
  username: string;
  email: string;
  avatar?: string;
  isAdmin?: boolean;
  isPremium?: boolean;
  createdAt?: string;
}

const DashboardPage: FC = () => {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (status === 'authenticated') {
          const response = await fetch('/api/user/profile');
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          const data = await response.json();
          setUserData(data);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (status !== 'loading') {
      fetchUserData();
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <>
        <Header />
        <main className="bg-dark min-h-screen py-8">
          <div className="container-custom">
            <div className="flex justify-center items-center py-20">
              <div className="animate-pulse text-primary">Loading dashboard...</div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <>
        <Header />
        <main className="bg-dark min-h-screen py-8">
          <div className="container-custom">
            <div className="bg-secondary rounded-lg p-6 shadow-lg text-center">
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p className="mb-6">You need to be logged in to view your dashboard.</p>
              <Link href="/login" className="btn-primary">
                Log In
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="bg-dark min-h-screen py-8">
        <div className="container-custom">
          {/* Dashboard Header */}
          {userData && (
            <div className="mb-8">
              <div className="bg-secondary rounded-lg p-6 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                    <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-primary">
                      <Image
                        src={userData.avatar || '/images/default-avatar.png'}
                        alt={userData.username}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h1 className="text-2xl font-bold mb-1">{userData.username}</h1>
                    <p className="text-gray-400 mb-4">
                      Member since {userData.createdAt 
                        ? new Date(userData.createdAt).toLocaleDateString() 
                        : 'N/A'}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {userData.isPremium && (
                        <div className="bg-primary px-3 py-1 rounded text-sm font-bold">
                          Premium Member
                        </div>
                      )}
                      {userData.isAdmin && (
                        <div className="bg-purple-600 px-3 py-1 rounded text-sm font-bold">
                          Admin
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
                    <Link href="/account/settings" className="btn-secondary flex items-center justify-center">
                      <FiSettings className="mr-2" />
                      Settings
                    </Link>
                    <Link href="/upload" className="btn-primary flex items-center justify-center">
                      <FiUpload className="mr-2" />
                      Upload
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Link href="/dashboard" className="bg-secondary flex flex-col items-center p-4 rounded-lg text-center hover:bg-secondary-light transition-colors">
              <FiUser size={24} className="mb-2 text-primary" />
              <span>Dashboard</span>
            </Link>
            <Link href="/dashboard/uploads" className="bg-secondary flex flex-col items-center p-4 rounded-lg text-center hover:bg-secondary-light transition-colors">
              <FiUpload size={24} className="mb-2 text-primary" />
              <span>Uploads</span>
            </Link>
            <Link href="/watchlater" className="bg-secondary flex flex-col items-center p-4 rounded-lg text-center hover:bg-secondary-light transition-colors">
              <FiClock size={24} className="mb-2 text-primary" />
              <span>Watch Later</span>
            </Link>
            <Link href="/history" className="bg-secondary flex flex-col items-center p-4 rounded-lg text-center hover:bg-secondary-light transition-colors">
              <FiList size={24} className="mb-2 text-primary" />
              <span>History</span>
            </Link>
            <Link href="/dashboard/favorites" className="bg-secondary flex flex-col items-center p-4 rounded-lg text-center hover:bg-secondary-light transition-colors">
              <FiHeart size={24} className="mb-2 text-primary" />
              <span>Favorites</span>
            </Link>
            <Link href="/dashboard/activity" className="bg-secondary flex flex-col items-center p-4 rounded-lg text-center hover:bg-secondary-light transition-colors">
              <FiClock size={24} className="mb-2 text-purple-500" />
              <span>Activity</span>
            </Link>
            <Link href="/dashboard/analytics" className="bg-secondary flex flex-col items-center p-4 rounded-lg text-center hover:bg-secondary-light transition-colors">
              <FiBarChart2 size={24} className="mb-2 text-blue-500" />
              <span>Analytics</span>
            </Link>
            <Link href="/account/settings" className="bg-secondary flex flex-col items-center p-4 rounded-lg text-center hover:bg-secondary-light transition-colors">
              <FiSettings size={24} className="mb-2 text-yellow-500" />
              <span>Settings</span>
            </Link>
          </div>

          {/* Dashboard Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Quick Stats */}
            {userData && (
              <div className="bg-secondary rounded-lg p-6 shadow-lg">
                <h2 className="text-xl font-bold mb-6">Account Overview</h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <FiUser className="mr-2 text-primary" />
                      <h3 className="font-medium">Personal Info</h3>
                    </div>
                    <div className="ml-7 space-y-1 text-sm">
                      <p className="text-gray-400">Username: <span className="text-gray-300">{userData.username}</span></p>
                      <p className="text-gray-400">Email: <span className="text-gray-300">{userData.email}</span></p>
                      <Link href="/account/settings/profile" className="text-primary text-xs hover:underline">
                        Edit Profile
                      </Link>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <FiCreditCard className="mr-2 text-primary" />
                      <h3 className="font-medium">Subscription</h3>
                    </div>
                    <div className="ml-7 space-y-1 text-sm">
                      <p className="text-gray-400">Plan: <span className={userData.isPremium ? "text-green-500 font-medium" : "text-gray-300"}>
                        {userData.isPremium ? "Premium" : "Free"}
                      </span></p>
                      <Link href="/account/settings/subscription" className="text-primary text-xs hover:underline">
                        {userData.isPremium ? "Manage Subscription" : "Upgrade to Premium"}
                      </Link>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <FiClock className="mr-2 text-primary" />
                      <h3 className="font-medium">Activity</h3>
                    </div>
                    <div className="ml-7 space-y-1 text-sm">
                      <p className="text-gray-400">Account created: <span className="text-gray-300">
                        {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                      </span></p>
                      <Link href="/dashboard/activity" className="text-primary text-xs hover:underline">
                        View Activity Log
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Storage Usage */}
            <div className="bg-secondary rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-6">Storage Usage</h2>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Used</span>
                  <span className="text-gray-300">{userData?.isPremium ? '2.4 GB / 10 GB' : '0 GB / 1 GB'}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: userData?.isPremium ? '24%' : '0%' }}></div>
                </div>
              </div>
              {!userData?.isPremium && (
                <div className="bg-dark p-3 rounded text-sm">
                  <p className="text-gray-400 mb-2">Need more storage?</p>
                  <Link href="/pricing" className="text-primary hover:underline">Upgrade to Premium</Link>
                </div>
              )}
            </div>

            {/* Video Performance */}
            <div className="bg-secondary rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-6">Video Performance</h2>
              {userData?.isPremium ? (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Total Views</span>
                    <span className="text-primary font-bold">0</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Total Likes</span>
                    <span className="text-primary font-bold">0</span>
                  </div>
                  <div className="flex justify-between mb-6">
                    <span className="text-gray-400">Watch Time</span>
                    <span className="text-primary font-bold">0 hours</span>
                  </div>
                  <Link href="/dashboard/analytics" className="text-primary text-sm hover:underline">
                    View detailed analytics →
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 mb-4">Analytics available for Premium members only</p>
                  <Link href="/pricing" className="btn-primary text-sm">
                    Upgrade to Premium
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Your Videos Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Your Uploads</h2>
              <Link href="/upload" className="text-primary hover:underline flex items-center">
                <FiUpload className="mr-1" size={16} />
                Upload New
              </Link>
            </div>
            <VideoGrid 
              title="Your Uploads" 
              endpoint="/api/videos/user"
              showFilters={false}
              limit={4}
            />
          </div>

          {/* Recently Viewed */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Recently Viewed</h2>
              <Link href="/history" className="text-primary hover:underline">
                View All History
              </Link>
            </div>
            <VideoGrid 
              title="Recently Viewed" 
              endpoint="/api/videos/history"
              showFilters={false}
              limit={4}
            />
          </div>

          {/* Favorites Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Your Favorites</h2>
              <Link href="/dashboard/favorites" className="text-primary hover:underline">
                View All Favorites
              </Link>
            </div>
            <VideoGrid 
              title="Favorites" 
              endpoint="/api/videos/favorites"
              showFilters={false}
              limit={4}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default DashboardPage; 