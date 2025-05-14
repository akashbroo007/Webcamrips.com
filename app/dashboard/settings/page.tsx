"use client"

import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FiUser, 
  FiCreditCard, 
  FiLock, 
  FiBell, 
  FiDownload, 
  FiShield, 
  FiLogOut,
  FiChevronRight 
} from 'react-icons/fi';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Mock user data
const userData = {
  id: 1,
  username: 'videolover',
  email: 'user@example.com',
  avatar: '/images/avatar1.jpg',
  isPremium: true,
};

const SettingsPage: FC = () => {
  return (
    <>
      <Header />
      <main className="bg-dark min-h-screen py-8">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Settings Navigation - Left Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-secondary rounded-lg overflow-hidden shadow-lg">
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-primary mr-3">
                      <Image
                        src={userData.avatar}
                        alt={userData.username}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{userData.username}</div>
                      <div className="text-sm text-gray-400">{userData.email}</div>
                    </div>
                  </div>
                </div>
                
                <nav className="p-2">
                  <Link 
                    href="/dashboard/settings/profile" 
                    className="flex items-center justify-between p-3 rounded-md hover:bg-secondary-light"
                  >
                    <div className="flex items-center">
                      <FiUser className="text-primary mr-3" />
                      <span>Profile</span>
                    </div>
                    <FiChevronRight className="text-gray-500" />
                  </Link>
                  
                  <Link 
                    href="/dashboard/settings/subscription" 
                    className="flex items-center justify-between p-3 rounded-md hover:bg-secondary-light"
                  >
                    <div className="flex items-center">
                      <FiCreditCard className="text-primary mr-3" />
                      <span>Subscription</span>
                    </div>
                    <FiChevronRight className="text-gray-500" />
                  </Link>
                  
                  <Link 
                    href="/dashboard/settings/security" 
                    className="flex items-center justify-between p-3 rounded-md hover:bg-secondary-light"
                  >
                    <div className="flex items-center">
                      <FiLock className="text-primary mr-3" />
                      <span>Security</span>
                    </div>
                    <FiChevronRight className="text-gray-500" />
                  </Link>
                  
                  <Link 
                    href="/dashboard/settings/notifications" 
                    className="flex items-center justify-between p-3 rounded-md hover:bg-secondary-light"
                  >
                    <div className="flex items-center">
                      <FiBell className="text-primary mr-3" />
                      <span>Notifications</span>
                    </div>
                    <FiChevronRight className="text-gray-500" />
                  </Link>
                  
                  <Link 
                    href="/dashboard/settings/downloads" 
                    className="flex items-center justify-between p-3 rounded-md hover:bg-secondary-light"
                  >
                    <div className="flex items-center">
                      <FiDownload className="text-primary mr-3" />
                      <span>Downloads</span>
                    </div>
                    <FiChevronRight className="text-gray-500" />
                  </Link>
                  
                  <Link 
                    href="/dashboard/settings/privacy" 
                    className="flex items-center justify-between p-3 rounded-md hover:bg-secondary-light"
                  >
                    <div className="flex items-center">
                      <FiShield className="text-primary mr-3" />
                      <span>Privacy</span>
                    </div>
                    <FiChevronRight className="text-gray-500" />
                  </Link>
                  
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <Link 
                      href="/api/auth/signout"
                      className="flex items-center p-3 text-red-500 rounded-md hover:bg-secondary-light"
                    >
                      <FiLogOut className="mr-3" />
                      <span>Logout</span>
                    </Link>
                  </div>
                </nav>
              </div>
            </div>
            
            {/* Main Content - Quick Settings Overview */}
            <div className="md:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Settings Quick Access */}
                <div className="bg-secondary rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Profile Settings</h2>
                    <FiUser className="text-primary text-2xl" />
                  </div>
                  <p className="text-gray-400 mb-4">Update your personal information, username, and profile picture.</p>
                  <Link 
                    href="/dashboard/settings/profile" 
                    className="bg-secondary-light hover:bg-opacity-80 text-white py-2 px-4 rounded-md text-sm inline-flex items-center"
                  >
                    Update Profile <FiChevronRight className="ml-1" />
                  </Link>
                </div>
                
                {/* Subscription Settings Quick Access */}
                <div className="bg-secondary rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Subscription</h2>
                    <FiCreditCard className="text-primary text-2xl" />
                  </div>
                  <p className="text-gray-400 mb-4">
                    {userData.isPremium ? 
                      'You have an active Premium subscription.' : 
                      'Upgrade to Premium for exclusive features.'}
                  </p>
                  <Link 
                    href="/dashboard/settings/subscription" 
                    className="bg-secondary-light hover:bg-opacity-80 text-white py-2 px-4 rounded-md text-sm inline-flex items-center"
                  >
                    {userData.isPremium ? 'Manage Subscription' : 'Upgrade Now'} <FiChevronRight className="ml-1" />
                  </Link>
                </div>
                
                {/* Security Settings Quick Access */}
                <div className="bg-secondary rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Security</h2>
                    <FiLock className="text-primary text-2xl" />
                  </div>
                  <p className="text-gray-400 mb-4">Update your password and manage account security options.</p>
                  <Link 
                    href="/dashboard/settings/security" 
                    className="bg-secondary-light hover:bg-opacity-80 text-white py-2 px-4 rounded-md text-sm inline-flex items-center"
                  >
                    Security Settings <FiChevronRight className="ml-1" />
                  </Link>
                </div>
                
                {/* Notification Settings Quick Access */}
                <div className="bg-secondary rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Notifications</h2>
                    <FiBell className="text-primary text-2xl" />
                  </div>
                  <p className="text-gray-400 mb-4">Configure email notifications and alerts preferences.</p>
                  <Link 
                    href="/dashboard/settings/notifications" 
                    className="bg-secondary-light hover:bg-opacity-80 text-white py-2 px-4 rounded-md text-sm inline-flex items-center"
                  >
                    Configure Notifications <FiChevronRight className="ml-1" />
                  </Link>
                </div>
                
                {/* Account Data Quick Access */}
                <div className="bg-secondary rounded-lg p-6 shadow-lg md:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Account Data</h2>
                    <FiDownload className="text-primary text-2xl" />
                  </div>
                  <p className="text-gray-400 mb-4">Manage your data and privacy settings. Download your data or delete your account.</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link 
                      href="/dashboard/settings/downloads" 
                      className="bg-secondary-light hover:bg-opacity-80 text-white py-2 px-4 rounded-md text-sm inline-flex items-center"
                    >
                      Download Data <FiDownload className="ml-1" />
                    </Link>
                    <Link 
                      href="/dashboard/settings/privacy" 
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm inline-flex items-center"
                    >
                      Privacy Settings <FiShield className="ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SettingsPage; 