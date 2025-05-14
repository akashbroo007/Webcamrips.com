'use client';

import React, { useState } from 'react';
import { FiShield, FiTrash2, FiKey, FiEye, FiEyeOff, FiAlertTriangle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { signOut } from 'next-auth/react';

export default function PrivacyPage() {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    activityTracking: true,
    shareWatchHistory: false,
    allowPersonalization: true,
  });

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // This would be a real API call in production
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success('Your account has been scheduled for deletion. You will be signed out now.');
      setTimeout(() => {
        signOut({ callbackUrl: '/' });
      }, 2000);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetting = (setting: keyof typeof privacySettings) => {
    if (typeof privacySettings[setting] === 'boolean') {
      setPrivacySettings({
        ...privacySettings,
        [setting]: !privacySettings[setting],
      });
    }
  };

  const handleChangeProfileVisibility = (visibility: string) => {
    setPrivacySettings({
      ...privacySettings,
      profileVisibility: visibility,
    });
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      toast.success('Privacy settings saved successfully');
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast.error('Failed to save privacy settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Privacy Settings */}
      <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center">
            <FiShield className="mr-2 text-primary" />
            Privacy Settings
          </h3>
        </div>
        
        <div className="p-6 border-b border-gray-700">
          <h4 className="text-lg font-medium mb-4">Profile Visibility</h4>
          
          <p className="text-gray-400 mb-4">
            Control who can see your profile and activity.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="radio"
                id="visibility-public"
                name="profileVisibility"
                className="w-4 h-4 text-primary bg-gray-700 border-gray-600 focus:ring-primary focus:ring-2"
                checked={privacySettings.profileVisibility === 'public'}
                onChange={() => handleChangeProfileVisibility('public')}
              />
              <label htmlFor="visibility-public" className="ml-2 text-sm font-medium text-gray-300">
                Public - Anyone can see your profile
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="radio"
                id="visibility-members"
                name="profileVisibility"
                className="w-4 h-4 text-primary bg-gray-700 border-gray-600 focus:ring-primary focus:ring-2"
                checked={privacySettings.profileVisibility === 'members'}
                onChange={() => handleChangeProfileVisibility('members')}
              />
              <label htmlFor="visibility-members" className="ml-2 text-sm font-medium text-gray-300">
                Members Only - Only registered users can see your profile
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="radio"
                id="visibility-private"
                name="profileVisibility"
                className="w-4 h-4 text-primary bg-gray-700 border-gray-600 focus:ring-primary focus:ring-2"
                checked={privacySettings.profileVisibility === 'private'}
                onChange={() => handleChangeProfileVisibility('private')}
              />
              <label htmlFor="visibility-private" className="ml-2 text-sm font-medium text-gray-300">
                Private - Your profile is hidden from other users
              </label>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-b border-gray-700">
          <h4 className="text-lg font-medium mb-4">Data Usage & Privacy</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <h5 className="font-medium flex items-center">
                  <FiEye className={`mr-2 ${privacySettings.activityTracking ? 'text-primary' : 'text-gray-500'}`} />
                  Activity Tracking
                </h5>
                <p className="text-sm text-gray-400">Allow us to track your activity to improve recommendations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={privacySettings.activityTracking}
                  onChange={() => handleToggleSetting('activityTracking')}
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <h5 className="font-medium flex items-center">
                  <FiEyeOff className={`mr-2 ${privacySettings.shareWatchHistory ? 'text-primary' : 'text-gray-500'}`} />
                  Share Watch History
                </h5>
                <p className="text-sm text-gray-400">Allow others to see what videos you've watched</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={privacySettings.shareWatchHistory}
                  onChange={() => handleToggleSetting('shareWatchHistory')}
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <h5 className="font-medium flex items-center">
                  <FiKey className={`mr-2 ${privacySettings.allowPersonalization ? 'text-primary' : 'text-gray-500'}`} />
                  Personalized Content
                </h5>
                <p className="text-sm text-gray-400">Allow us to personalize content based on your preferences</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={privacySettings.allowPersonalization}
                  onChange={() => handleToggleSetting('allowPersonalization')}
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
          
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="mt-6 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md flex items-center"
          >
            {loading ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                Saving...
              </>
            ) : (
              'Save Privacy Settings'
            )}
          </button>
        </div>
        
        {/* Delete Account */}
        <div className="p-6">
          <h4 className="text-lg font-medium mb-2 flex items-center text-red-500">
            <FiTrash2 className="mr-2" />
            Delete Account
          </h4>
          
          <p className="text-gray-400 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-md flex items-center"
            >
              <FiTrash2 className="mr-2" />
              Delete My Account
            </button>
          ) : (
            <div className="bg-gray-800 border border-red-800 rounded-lg p-4">
              <div className="flex items-start mb-4">
                <FiAlertTriangle className="text-red-500 mt-1 mr-2 flex-shrink-0" />
                <p className="text-sm text-gray-300">
                  This will permanently delete your account, all your personal information, saved content, and subscription data. This action cannot be undone.
                </p>
              </div>
              
              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                    Enter your password to confirm deletion
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-4 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading || !deletePassword}
                    className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-md flex items-center"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FiTrash2 className="mr-2" />
                        Confirm Deletion
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 