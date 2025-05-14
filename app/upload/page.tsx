'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      const allowedTypes = ['video/mp4', 'video/x-matroska', 'video/avi', 'video/webm'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Invalid file type. Supported formats: MP4, MKV, AVI, WEBM');
        return;
      }

      // Validate file size (5GB max)
      const maxSize = 5 * 1024 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setError('File size exceeds maximum limit of 5GB');
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            router.push(`/video/${response.video.id}`);
          } else {
            setError(response.error || 'Upload failed');
          }
        } else {
          setError('Upload failed. Please try again.');
        }
        setUploading(false);
      };

      xhr.onerror = () => {
        setError('Network error. Please try again.');
        setUploading(false);
      };

      xhr.send(formData);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Upload Video</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Select Video File
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={uploading}
              />
            </div>
            
            {file && (
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  Selected file: {file.name}
                </p>
                <p className="text-sm text-gray-600">
                  Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {uploading && (
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Uploading... {progress.toFixed(1)}%
                </p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                !file || uploading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
              </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 