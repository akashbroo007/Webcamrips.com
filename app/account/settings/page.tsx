'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FiUser, FiCreditCard, FiLock, FiBell, FiDownload, FiShield } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

// User profile data structure
interface UserProfile {
  id?: string;
  username?: string;
  email?: string;
  avatar?: string;
  isAdmin?: boolean;
  isPremium?: boolean;
  createdAt?: string;
}

export default function AccountSettingsPage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === 'authenticated' && session?.user) {
        try {
          // Get custom properties from session safely using optional chaining
          const isAdmin = session.user?.isAdmin as boolean | undefined;
          const isPremium = session.user?.isPremium as boolean | undefined;
          
          // First set basic data from session to avoid showing default values
          const sessionUserData = {
            username: session.user.name || 'User',
            email: session.user.email || '',
            avatar: session.user.image || '',
            isAdmin: isAdmin || false,
            isPremium: isPremium || false
          };
          
          // Use session data immediately - important to prevent default videolover data
          setUser(sessionUserData);
          
          // Then fetch detailed data from API
          const response = await fetch('/api/user/profile', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
            // Add timestamp to prevent caching
            next: { revalidate: 0 }
          });
          
          if (response.ok) {
            const userData = await response.json();
            if (userData && userData.email === session.user.email) {
              // Only update if the data matches the current session
              setUser(userData);
            }
          } else {
            console.error('Failed to fetch user profile:', await response.text());
            toast.error('Failed to load profile data');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast.error('Error loading user data');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session, status]);

  if (loading) {
    return (
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto my-12"></div>
    );
  }

  // Safely extract user properties with defaults
  const isAdmin = user?.isAdmin || (session?.user?.isAdmin as boolean | undefined) || false;
  const isPremium = user?.isPremium || (session?.user?.isPremium as boolean | undefined) || false;

  return (
    <>
      {/* Profile Settings */}
      <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center">
            <FiUser className="mr-2 text-primary" />
            Profile Settings
          </h3>
          <div className="flex items-center space-x-4">
            <Link href="/account/profile" className="text-primary hover:underline">
              View Profile
            </Link>
            <Link href="/account/profile/edit" className="text-primary hover:underline">
              Edit Profile
            </Link>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-400 mb-6">
            View and update your personal information, username, and profile picture.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/account/profile" className="btn-primary inline-block">
              View Profile
            </Link>
            <Link href="/account/profile/edit" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md inline-block">
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
      
      {/* Subscription */}
      <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center">
            <FiCreditCard className="mr-2 text-primary" />
            Subscription
          </h3>
          <Link href="/account/subscription" className="text-primary hover:underline">
            Manage Subscription
          </Link>
        </div>
        <div className="p-6">
          {isPremium ? (
            <div>
              <div className="mb-4">
                <span className="bg-green-800 text-green-200 px-3 py-1 rounded-full text-sm">Active Premium</span>
              </div>
              <p className="text-gray-400 mb-6">
                You have an active Premium subscription. Enjoy all the benefits!
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">Free Account</span>
              </div>
              <p className="text-gray-400 mb-6">
                Upgrade to Premium for unlimited access to all videos and features.
              </p>
              <Link href="/pricing" className="btn-primary inline-block">
                Upgrade to Premium
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Security */}
      <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center">
            <FiLock className="mr-2 text-primary" />
            Security
          </h3>
          <Link href="/account/security" className="text-primary hover:underline">
            Update Security
          </Link>
        </div>
        <div className="p-6">
          <p className="text-gray-400 mb-6">
            Manage your password, two-factor authentication, and account access.
          </p>
          <Link href="/account/security" className="btn-primary inline-block">
            Manage Security
          </Link>
        </div>
      </div>
      
      {/* Notifications */}
      <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center">
            <FiBell className="mr-2 text-primary" />
            Notifications
          </h3>
          <Link href="/account/notifications" className="text-primary hover:underline">
            Configure Notifications
          </Link>
        </div>
        <div className="p-6">
          <p className="text-gray-400 mb-6">
            Configure email notifications and alerts preferences.
          </p>
          <Link href="/account/notifications" className="btn-primary inline-block">
            Configure Notifications
          </Link>
        </div>
      </div>
      
      {/* Account Data */}
      <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center">
            <FiDownload className="mr-2 text-primary" />
            Account Data
          </h3>
        </div>
        <div className="p-6">
          <p className="text-gray-400 mb-6">
            Manage your data and privacy settings. Download your data or delete your account.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/account/downloads" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md inline-flex items-center">
              <FiDownload className="mr-2" />
              Download Data
            </Link>
            <Link href="/account/privacy" className="bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-md inline-flex items-center">
              <FiShield className="mr-2" />
              Privacy Settings
            </Link>
          </div>
        </div>
      </div>
      
      {/* Admin Panel Link (only for admins) */}
      {isAdmin && (
        <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center">
              <FiUser className="mr-2 text-primary" />
              Admin Controls
            </h3>
          </div>
          <div className="p-6">
            <p className="text-gray-400 mb-6">
              Access the admin dashboard to manage users, videos, and site settings.
            </p>
            <Link href="/admin" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md inline-flex items-center">
              Go to Admin Dashboard
            </Link>
          </div>
        </div>
      )}
    </>
  );
} 