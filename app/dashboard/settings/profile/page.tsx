"use client"

import { FC, useState, ChangeEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiUser, FiChevronLeft, FiUpload, FiEdit2, FiSave } from 'react-icons/fi';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Mock user data
const userData = {
  id: 1,
  username: 'videolover',
  email: 'user@example.com',
  displayName: 'Video Lover',
  avatar: '/images/avatar1.jpg',
  bio: 'Passionate about high-quality webcam content. Always on the lookout for the best streams.',
  location: 'New York, USA',
  registeredSince: '2023-09-15',
  websiteUrl: 'https://example.com',
};

const ProfileSettingsPage: FC = () => {
  const [formData, setFormData] = useState({
    displayName: userData.displayName,
    email: userData.email,
    username: userData.username,
    bio: userData.bio,
    location: userData.location,
    websiteUrl: userData.websiteUrl,
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would send the updated data to your API
    alert('Profile updated successfully!');
    setIsEditing(false);
  };
  
  return (
    <>
      <Header />
      <main className="bg-dark min-h-screen py-8">
        <div className="container-custom">
          {/* Back to Settings link */}
          <Link 
            href="/dashboard/settings" 
            className="inline-flex items-center text-primary hover:underline mb-6"
          >
            <FiChevronLeft className="mr-1" /> Back to Settings
          </Link>
          
          <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
            <div className="bg-secondary-light p-6 border-b border-gray-700">
              <h1 className="text-2xl font-bold flex items-center">
                <FiUser className="mr-2" /> Profile Settings
              </h1>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Avatar Section */}
                  <div className="md:col-span-1">
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4">
                        <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-primary">
                          <Image
                            src={avatarPreview || userData.avatar}
                            alt={userData.username}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <label 
                          htmlFor="avatar-upload" 
                          className="absolute bottom-0 right-0 bg-primary p-2 rounded-full text-white cursor-pointer"
                        >
                          <FiEdit2 size={16} />
                          <input 
                            type="file" 
                            id="avatar-upload"
                            accept="image/*" 
                            className="hidden"
                            onChange={handleAvatarChange}
                          />
                        </label>
                      </div>
                      <div className="text-center mb-4">
                        <div className="font-medium text-lg">{userData.username}</div>
                        <div className="text-gray-400 text-sm">Member since {new Date(userData.registeredSince).toLocaleDateString()}</div>
                      </div>
                      <div className="flex space-x-2">
                        {!isEditing ? (
                          <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md inline-flex items-center"
                          >
                            <FiEdit2 className="mr-2" /> Edit Profile
                          </button>
                        ) : (
                          <>
                            <button
                              type="submit"
                              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md inline-flex items-center"
                            >
                              <FiSave className="mr-2" /> Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditing(false);
                                setFormData({
                                  displayName: userData.displayName,
                                  email: userData.email,
                                  username: userData.username,
                                  bio: userData.bio,
                                  location: userData.location,
                                  websiteUrl: userData.websiteUrl,
                                });
                                setAvatarPreview(null);
                              }}
                              className="bg-secondary-light text-white py-2 px-4 rounded-md"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Profile Info Section */}
                  <div className="md:col-span-2">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Display Name</label>
                          <input
                            type="text"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`w-full bg-dark border ${isEditing ? 'border-primary' : 'border-gray-700'} rounded-md p-2 text-white`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`w-full bg-dark border ${isEditing ? 'border-primary' : 'border-gray-700'} rounded-md p-2 text-white`}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full bg-dark border ${isEditing ? 'border-primary' : 'border-gray-700'} rounded-md p-2 text-white`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          rows={4}
                          className={`w-full bg-dark border ${isEditing ? 'border-primary' : 'border-gray-700'} rounded-md p-2 text-white`}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`w-full bg-dark border ${isEditing ? 'border-primary' : 'border-gray-700'} rounded-md p-2 text-white`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Website</label>
                          <input
                            type="url"
                            name="websiteUrl"
                            value={formData.websiteUrl}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`w-full bg-dark border ${isEditing ? 'border-primary' : 'border-gray-700'} rounded-md p-2 text-white`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProfileSettingsPage; 