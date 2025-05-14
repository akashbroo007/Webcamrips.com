'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiUser, FiMail, FiUpload, FiSave } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id?: string;
  username?: string;
  email?: string;
  avatar?: string;
  bio?: string;
}

export default function EditProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({
    username: '',
    email: '',
    avatar: '',
    bio: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user) {
        try {
          // First set data from session
          setProfile({
            username: session.user.name || '',
            email: session.user.email || '',
            avatar: session.user.image || '',
            bio: '',
          });
          
          // Then get full profile from API
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
              setProfile({
                username: userData.username || session.user.name || '',
                email: userData.email || session.user.email || '',
                avatar: userData.avatar || session.user.image || '',
                bio: userData.bio || '',
              });
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          toast.error('Failed to load profile data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Store the file for later upload
      setAvatarFile(file);
      
      // Preview the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let avatarUrl = profile.avatar;
      
      // Handle avatar upload if a new file was selected
      if (avatarFile) {
        try {
          const formData = new FormData();
          formData.append('file', avatarFile);
          
          // If you have an upload API endpoint, uncomment and use this
          // const uploadResponse = await fetch('/api/upload', {
          //   method: 'POST',
          //   body: formData,
          // });
          
          // if (uploadResponse.ok) {
          //   const uploadData = await uploadResponse.json();
          //   avatarUrl = uploadData.url;
          // } else {
          //   throw new Error('Failed to upload avatar');
          // }
          
          // For now, we'll use the data URL as the avatar (this is a simplification)
          // In a production environment, you would upload to a storage service
          avatarUrl = previewAvatar || profile.avatar;
        } catch (error) {
          console.error('Error uploading avatar:', error);
          toast.error('Failed to upload avatar image');
          // Continue with the profile update even if avatar upload fails
        }
      }
      
      // Update profile data
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: profile.username,
          bio: profile.bio,
          avatar: avatarUrl,
        }),
      });
      
      if (response.ok) {
        // Update the session to reflect the changes
        await updateSession({
          user: {
            name: profile.username,
            image: avatarUrl,
          }
        });
        
        toast.success('Profile updated successfully');
        router.push('/account/profile');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred while updating your profile');
    } finally {
      setSaving(false);
    }
  };

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
          Edit Profile
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center mb-6">
          <div 
            className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 mb-4 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
            onClick={triggerFileInput}
          >
            {previewAvatar || profile.avatar ? (
              <img 
                src={previewAvatar || profile.avatar} 
                alt="User Avatar" 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/default-avatar.svg';
                }}
              />
            ) : (
              <FiUser size={64} className="text-gray-500" />
            )}
          </div>
          
          <button 
            type="button"
            onClick={triggerFileInput}
            className="flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm"
          >
            <FiUpload className="mr-2" />
            Change Avatar
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          <p className="text-xs text-gray-400 mt-2">
            Recommended: Square image, at least 200x200 pixels
          </p>
        </div>
        
        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUser className="text-gray-500" />
            </div>
            <input
              type="text"
              id="username"
              name="username"
              value={profile.username}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 pl-10 pr-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
        </div>
        
        {/* Email (Read-only) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email (cannot be changed)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className="text-gray-500" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              readOnly
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 pl-10 pr-4 text-white opacity-75 cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Contact support to change your email address
          </p>
        </div>
        
        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={profile.bio}
            onChange={handleInputChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={4}
            placeholder="Tell us about yourself..."
            maxLength={200}
          ></textarea>
          <p className="text-xs text-gray-400 mt-1">
            Maximum 200 characters
          </p>
        </div>
        
        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => router.push('/account/profile')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center"
          >
            {saving ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                Saving...
              </>
            ) : (
              <>
                <FiSave className="mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 