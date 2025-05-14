'use client';

import React, { useState } from 'react';
import { FiLock, FiKey, FiShield, FiSmartphone } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      
      if (response.ok) {
        toast.success('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('An error occurred while updating your password');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTwoFactor = async () => {
    // This is a placeholder for future implementation
    toast.success(`Two-factor authentication ${twoFactorEnabled ? 'disabled' : 'enabled'}`);
    setTwoFactorEnabled(!twoFactorEnabled);
  };

  return (
    <>
      <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center">
            <FiLock className="mr-2 text-primary" />
            Security Settings
          </h3>
        </div>
        
        {/* Password Change Section */}
        <div className="p-6 border-b border-gray-700">
          <h4 className="text-lg font-medium mb-4 flex items-center">
            <FiKey className="mr-2 text-primary" />
            Change Password
          </h4>
          
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                minLength={8}
              />
              <p className="text-xs text-gray-400 mt-1">Password must be at least 8 characters long</p>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Updating...
                </span>
              ) : 'Update Password'}
            </button>
          </form>
        </div>
        
        {/* Two-Factor Authentication */}
        <div className="p-6 border-b border-gray-700">
          <h4 className="text-lg font-medium mb-4 flex items-center">
            <FiSmartphone className="mr-2 text-primary" />
            Two-Factor Authentication
          </h4>
          
          <p className="text-gray-400 mb-4">
            Add an extra layer of security to your account by enabling two-factor authentication.
          </p>
          
          <div className="flex items-center mt-4">
            <button 
              onClick={handleToggleTwoFactor}
              className={`px-4 py-2 rounded-md flex items-center ${
                twoFactorEnabled 
                  ? 'bg-red-800 hover:bg-red-700' 
                  : 'bg-green-800 hover:bg-green-700'
              } text-white`}
            >
              <FiShield className="mr-2" />
              {twoFactorEnabled ? 'Disable' : 'Enable'} Two-Factor Authentication
            </button>
            
            <span className={`ml-3 px-2 py-1 rounded-full text-xs ${
              twoFactorEnabled ? 'bg-green-800 text-green-200' : 'bg-gray-800 text-gray-300'
            }`}>
              {twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
        
        {/* Account Activity */}
        <div className="p-6">
          <h4 className="text-lg font-medium mb-4 flex items-center">
            <FiShield className="mr-2 text-primary" />
            Account Activity
          </h4>
          
          <p className="text-gray-400 mb-4">
            Monitor and manage your account's recent activity and active sessions.
          </p>
          
          <div className="bg-gray-800 rounded-md p-4 mb-4">
            <h5 className="font-medium mb-2">Recent Logins</h5>
            <div className="text-gray-400 text-sm">
              <p>No recent login data available.</p>
            </div>
          </div>
          
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md">
            View Account Activity
          </button>
        </div>
      </div>
    </>
  );
} 