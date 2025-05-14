"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const sourceTypes = ['youtube', 'vimeo', 'direct', 'iframe', 'other'];
const platforms = ['Chaturbate', 'Stripchat', 'BongaCams', 'LiveJasmin', 'MyFreeCams', 'Camsoda', 'Other'];

export default function AddExternalVideoForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sourceUrl: '',
    embedUrl: '',
    thumbnailUrl: '',
    duration: '',
    sourceType: 'iframe',
    sourceId: '',
    platform: 'Stripchat',
    performerName: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/external-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          duration: formData.duration ? Number(formData.duration) : undefined,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add video');
      }
      
      setSuccess('Video added successfully!');
      setFormData({
        title: '',
        description: '',
        sourceUrl: '',
        embedUrl: '',
        thumbnailUrl: '',
        duration: '',
        sourceType: 'iframe',
        sourceId: '',
        platform: 'Stripchat',
        performerName: ''
      });
      
      // Redirect to the video page
      router.push(`/videos/${data.video._id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to add video');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-6 text-center">Add External Video</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium">Performer Name</label>
            <input
              type="text"
              name="performerName"
              value={formData.performerName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Source URL *</label>
            <input
              type="url"
              name="sourceUrl"
              value={formData.sourceUrl}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium">Embed URL *</label>
            <input
              type="url"
              name="embedUrl"
              value={formData.embedUrl}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Thumbnail URL *</label>
            <input
              type="url"
              name="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium">Duration (seconds)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Source Type *</label>
            <select
              name="sourceType"
              value={formData.sourceType}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            >
              {sourceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium">Platform *</label>
            <select
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            >
              {platforms.map(platform => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium">Source ID</label>
            <input
              type="text"
              name="sourceId"
              value={formData.sourceId}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isLoading ? 'Adding...' : 'Add Video'}
          </button>
        </div>
      </form>
    </div>
  );
} 