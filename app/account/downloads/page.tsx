'use client';

import React, { useState } from 'react';
import { FiDownload, FiFileText, FiClock, FiCalendar, FiDatabase, FiUser, FiPlayCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

// Mock data for downloaded videos
const downloadedVideos = [
  {
    id: '1',
    title: 'Hot Blonde Webcam Show',
    downloadDate: '2023-12-15',
    expiryDate: '2024-01-15',
    fileSize: '1.2 GB',
    thumbnail: '/images/thumbnails/video1.jpg'
  },
  {
    id: '2',
    title: 'Brunette After Dark Stream',
    downloadDate: '2023-12-10',
    expiryDate: '2024-01-10',
    fileSize: '850 MB',
    thumbnail: '/images/thumbnails/video2.jpg'
  },
  {
    id: '3',
    title: 'Redhead Premium Show',
    downloadDate: '2023-12-05',
    expiryDate: '2024-01-05',
    fileSize: '1.5 GB',
    thumbnail: '/images/thumbnails/video3.jpg'
  }
];

export default function DownloadsPage() {
  const [loading, setLoading] = useState(false);
  const [requestingData, setRequestingData] = useState(false);
  const [downloads, setDownloads] = useState(downloadedVideos);

  const handleRequestData = async () => {
    setRequestingData(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Data export requested. You will receive an email when your data is ready.');
    } catch (error) {
      console.error('Error requesting data export:', error);
      toast.error('Failed to request data export');
    } finally {
      setRequestingData(false);
    }
  };

  const handleDeleteDownload = async (id: string) => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Filter out the deleted download
      const updatedDownloads = downloads.filter(download => download.id !== id);
      setDownloads(updatedDownloads);
      
      toast.success('Download removed successfully');
    } catch (error) {
      console.error('Error deleting download:', error);
      toast.error('Failed to delete download');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Downloads */}
      <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center">
            <FiDownload className="mr-2 text-primary" />
            Your Downloads
          </h3>
        </div>
        
        <div className="p-6">
          <p className="text-gray-400 mb-6">
            Manage your downloaded content. Downloads expire 30 days after download date.
          </p>
          
          {downloads.length > 0 ? (
            <div className="space-y-4">
              {downloads.map((download) => (
                <div key={download.id} className="bg-gray-800 rounded-lg overflow-hidden flex flex-col sm:flex-row">
                  <div className="w-full sm:w-40 h-32 bg-gray-900 flex-shrink-0">
                    {download.thumbnail ? (
                      <img 
                        src={download.thumbnail} 
                        alt={download.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/default-thumbnail.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        <FiPlayCircle size={40} className="text-gray-600" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 flex-grow">
                    <h4 className="text-lg font-medium mb-2">{download.title}</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm text-gray-400">
                      <div className="flex items-center">
                        <FiCalendar className="mr-2" />
                        <span>Downloaded: {new Date(download.downloadDate).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <FiClock className="mr-2" />
                        <span>Expires: {new Date(download.expiryDate).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <FiFileText className="mr-2" />
                        <span>Size: {download.fileSize}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-3">
                      <a 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          toast.success('Download started');
                        }}
                        className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md flex items-center"
                      >
                        <FiDownload className="mr-2" />
                        Download Again
                      </a>
                      
                      <button 
                        onClick={() => handleDeleteDownload(download.id)}
                        disabled={loading}
                        className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-md"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <FiDownload size={48} className="text-gray-600 mx-auto mb-4" />
              <h4 className="text-xl font-medium mb-2">No Downloads</h4>
              <p className="text-gray-400">
                You haven't downloaded any videos yet. Premium members can download videos for offline viewing.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Data Export */}
      <div className="bg-secondary rounded-lg shadow-lg overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center">
            <FiDatabase className="mr-2 text-primary" />
            Download Your Data
          </h3>
        </div>
        
        <div className="p-6">
          <p className="text-gray-400 mb-6">
            Request a copy of your personal data. This includes your profile information, subscription details, and activity history.
          </p>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h4 className="font-medium flex items-center mb-4">
              <FiUser className="mr-2 text-primary" />
              Personal Data Export
            </h4>
            
            <p className="text-sm text-gray-400 mb-4">
              Your data will be packaged and sent to your email address. This process may take up to 24 hours to complete.
            </p>
            
            <button
              onClick={handleRequestData}
              disabled={requestingData}
              className="btn-primary"
            >
              {requestingData ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                  Processing Request...
                </span>
              ) : (
                <span className="flex items-center">
                  <FiDownload className="mr-2" />
                  Request Data Export
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 