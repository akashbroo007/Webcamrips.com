'use client';

import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiCalendar, FiEdit, FiExternalLink } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface UserProfile {
  id?: string;
  username?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  createdAt?: string;
  isAdmin?: boolean;
  isPremium?: boolean;
}

// Extend the session type to include custom properties
interface CustomUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isAdmin?: boolean;
  isPremium?: boolean;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user) {
        try {
          // Type assertion to access custom user properties
          const customUser = session.user as CustomUser;
          
          // First set basic data from session
          setUser({
            username: customUser.name || 'User',
            email: customUser.email || '',
            avatar: customUser.image || '',
            isAdmin: customUser.isAdmin || false,
            isPremium: customUser.isPremium || false,
          });
          
          // Then fetch detailed data from API
          const response = await fetch('/api/user/profile', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          });
          
          if (response.ok) {
            const userData = await response.json();
            if (userData) {
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
      }
    };

    fetchUserData();
  }, [session]);

  if (loading) {
    return (
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto my-12"></div>
    );
  }

  return (
    <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center">
          <FiUser className="mr-2 text-primary" />
          My Profile
        </h3>
        <Link href="/account/profile/edit" className="text-primary hover:text-primary-dark">
          <FiEdit className="inline mr-1" />
          Edit Profile
        </Link>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Image */}
          <div className="flex flex-col items-center md:items-start">
            <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center mb-4">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.username || 'User'} 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/default-avatar.svg';
                  }}
                />
              ) : (
                <FiUser size={64} className="text-gray-500" />
              )}
            </div>
            
            {user?.isPremium && (
              <span className="bg-green-800 text-green-200 px-3 py-1 rounded-full text-sm">
                Premium Member
              </span>
            )}
            
            {user?.isAdmin && (
              <span className="mt-2 bg-purple-800 text-purple-200 px-3 py-1 rounded-full text-sm">
                Administrator
              </span>
            )}
          </div>
          
          {/* Profile Information */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-4">{user?.username}</h2>
            
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center">
                <FiMail className="mr-2 text-primary" />
                <span>{user?.email}</span>
              </div>
              
              {user?.createdAt && (
                <div className="flex items-center">
                  <FiCalendar className="mr-2 text-primary" />
                  <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              )}
              
              {user?.bio && (
                <div className="mt-4">
                  <h4 className="text-lg font-medium mb-2">About Me</h4>
                  <p className="text-gray-400 whitespace-pre-line">{user.bio}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/account/profile/edit" className="btn-primary">
                <FiEdit className="mr-2" />
                Edit Profile
              </Link>
              
              <Link href="/account/security" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center">
                Manage Security
              </Link>
              
              {user?.isPremium ? (
                <Link href="/account/subscription" className="bg-green-800 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center">
                  Manage Subscription
                </Link>
              ) : (
                <Link href="/pricing" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex items-center">
                  <FiExternalLink className="mr-2" />
                  Upgrade to Premium
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 