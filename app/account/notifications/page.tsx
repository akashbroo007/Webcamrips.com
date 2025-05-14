'use client';

import React, { useState } from 'react';
import { FiBell, FiMail, FiSave } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface NotificationSettings {
  email: {
    newsletter: boolean;
    accountUpdates: boolean;
    newVideos: boolean;
    specialOffers: boolean;
  };
  site: {
    newComments: boolean;
    replies: boolean;
    subscriptionAlerts: boolean;
    newContentAlerts: boolean;
  };
}

export default function NotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      newsletter: true,
      accountUpdates: true,
      newVideos: false,
      specialOffers: true,
    },
    site: {
      newComments: true,
      replies: true,
      subscriptionAlerts: true,
      newContentAlerts: true,
    },
  });

  const handleToggleEmail = (key: keyof typeof settings.email) => {
    setSettings({
      ...settings,
      email: {
        ...settings.email,
        [key]: !settings.email[key],
      },
    });
  };

  const handleToggleSite = (key: keyof typeof settings.site) => {
    setSettings({
      ...settings,
      site: {
        ...settings.site,
        [key]: !settings.site[key],
      },
    });
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // In a real app, you would save the settings to your backend
      // const response = await fetch('/api/user/notifications', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(settings),
      // });
      
      toast.success('Notification preferences saved');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribeAll = async () => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      setSettings({
        email: {
          newsletter: false,
          accountUpdates: false,
          newVideos: false,
          specialOffers: false,
        },
        site: {
          ...settings.site,
        },
      });
      
      toast.success('Unsubscribed from all emails');
    } catch (error) {
      console.error('Error updating email preferences:', error);
      toast.error('Failed to update email preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center">
            <FiBell className="mr-2 text-primary" />
            Notification Settings
          </h3>
        </div>
        
        {/* Email Notifications */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium flex items-center">
              <FiMail className="mr-2 text-primary" />
              Email Notifications
            </h4>
            <button 
              onClick={handleUnsubscribeAll}
              className="text-red-400 hover:text-red-300 text-sm"
              disabled={loading}
            >
              Unsubscribe from all
            </button>
          </div>
          
          <p className="text-gray-400 mb-6">
            Configure what types of emails you would like to receive.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div>
                <h5 className="font-medium">Weekly Newsletter</h5>
                <p className="text-sm text-gray-400">Receive updates on new content and promotions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.email.newsletter}
                  onChange={() => handleToggleEmail('newsletter')}
                  disabled={loading}
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div>
                <h5 className="font-medium">Account Updates</h5>
                <p className="text-sm text-gray-400">Important notifications about your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.email.accountUpdates}
                  onChange={() => handleToggleEmail('accountUpdates')}
                  disabled={loading}
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div>
                <h5 className="font-medium">New Videos</h5>
                <p className="text-sm text-gray-400">Get notified when new videos are posted</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.email.newVideos}
                  onChange={() => handleToggleEmail('newVideos')}
                  disabled={loading}
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div>
                <h5 className="font-medium">Special Offers</h5>
                <p className="text-sm text-gray-400">Receive special deals and promotions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.email.specialOffers}
                  onChange={() => handleToggleEmail('specialOffers')}
                  disabled={loading}
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* Site Notifications */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium flex items-center">
              <FiBell className="mr-2 text-primary" />
              Website Notifications
            </h4>
          </div>
          
          <p className="text-gray-400 mb-6">
            Configure what notifications you'll see while browsing the site.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div>
                <h5 className="font-medium">New Comments</h5>
                <p className="text-sm text-gray-400">Get notified when someone comments on your content</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.site.newComments}
                  onChange={() => handleToggleSite('newComments')}
                  disabled={loading}
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div>
                <h5 className="font-medium">Replies</h5>
                <p className="text-sm text-gray-400">Get notified when someone replies to your comments</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.site.replies}
                  onChange={() => handleToggleSite('replies')}
                  disabled={loading}
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div>
                <h5 className="font-medium">Subscription Alerts</h5>
                <p className="text-sm text-gray-400">Get notified about your subscription status</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.site.subscriptionAlerts}
                  onChange={() => handleToggleSite('subscriptionAlerts')}
                  disabled={loading}
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div>
                <h5 className="font-medium">New Content Alerts</h5>
                <p className="text-sm text-gray-400">Get notified when new content is available</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.site.newContentAlerts}
                  onChange={() => handleToggleSite('newContentAlerts')}
                  disabled={loading}
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* Save Button */}
        <div className="p-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary flex items-center"
          >
            {loading ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                Saving...
              </>
            ) : (
              <>
                <FiSave className="mr-2" />
                Save Preferences
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
} 