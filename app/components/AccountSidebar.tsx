'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FiUser, FiCreditCard, FiLock, FiBell, FiDownload, FiShield, FiLogOut } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import FallbackImage from '@/app/components/FallbackImage';

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const AccountSidebar: React.FC<SidebarProps> = ({ user }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  // Function to determine if the link is active
  const isActive = (path: string) => {
    if (path === '/account/profile' && pathname.startsWith('/account/profile')) {
      return true;
    }
    return pathname === path;
  };

  const username = user?.name || 'User';
  const email = user?.email || '';
  const avatar = user?.image || '';

  return (
    <div className="bg-secondary rounded-lg p-6 shadow-lg">
      <div className="flex items-center mb-6">
        <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
          {avatar ? (
            <FallbackImage 
              src={avatar}
              alt={username}
              width={64}
              height={64}
              type="avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <FiUser size={32} />
          )}
        </div>
        <div className="ml-3">
          <h2 className="text-xl font-semibold">{username}</h2>
          <p className="text-gray-400">{email}</p>
        </div>
      </div>
      
      <nav className="space-y-1">
        <Link 
          href="/account/profile" 
          className={`flex items-center py-3 px-4 rounded-md ${
            isActive('/account/profile') 
              ? 'bg-gray-800 text-primary' 
              : 'hover:bg-gray-800 text-gray-300 hover:text-white'
          }`}
        >
          <FiUser className="mr-3" />
          My Profile
        </Link>
        <Link 
          href="/account/settings" 
          className={`flex items-center py-3 px-4 rounded-md ${
            isActive('/account/settings') 
              ? 'bg-gray-800 text-primary' 
              : 'hover:bg-gray-800 text-gray-300 hover:text-white'
          }`}
        >
          <FiUser className="mr-3" />
          Account Settings
        </Link>
        <Link 
          href="/account/subscription" 
          className={`flex items-center py-3 px-4 rounded-md ${
            isActive('/account/subscription') 
              ? 'bg-gray-800 text-primary' 
              : 'hover:bg-gray-800 text-gray-300 hover:text-white'
          }`}
        >
          <FiCreditCard className="mr-3" />
          Subscription
        </Link>
        <Link 
          href="/account/security" 
          className={`flex items-center py-3 px-4 rounded-md ${
            isActive('/account/security') 
              ? 'bg-gray-800 text-primary' 
              : 'hover:bg-gray-800 text-gray-300 hover:text-white'
          }`}
        >
          <FiLock className="mr-3" />
          Security
        </Link>
        <Link 
          href="/account/notifications" 
          className={`flex items-center py-3 px-4 rounded-md ${
            isActive('/account/notifications') 
              ? 'bg-gray-800 text-primary' 
              : 'hover:bg-gray-800 text-gray-300 hover:text-white'
          }`}
        >
          <FiBell className="mr-3" />
          Notifications
        </Link>
        <Link 
          href="/account/downloads" 
          className={`flex items-center py-3 px-4 rounded-md ${
            isActive('/account/downloads') 
              ? 'bg-gray-800 text-primary' 
              : 'hover:bg-gray-800 text-gray-300 hover:text-white'
          }`}
        >
          <FiDownload className="mr-3" />
          Downloads
        </Link>
        <Link 
          href="/account/privacy" 
          className={`flex items-center py-3 px-4 rounded-md ${
            isActive('/account/privacy') 
              ? 'bg-gray-800 text-primary' 
              : 'hover:bg-gray-800 text-gray-300 hover:text-white'
          }`}
        >
          <FiShield className="mr-3" />
          Privacy
        </Link>
        <Link 
          href="/logout" 
          className="w-full flex items-center py-3 px-4 rounded-md hover:bg-gray-800 text-red-500 hover:text-red-400"
        >
          <FiLogOut className="mr-3" />
          Logout
        </Link>
      </nav>
    </div>
  );
};

export default AccountSidebar; 