'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FiClock, FiAlertCircle, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import VideoCard from '@/components/video/VideoCard';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import HistoryService from '@/lib/services/historyService';

interface Video {
  _id: string;
  title: string;
  thumbnail: string;
  duration: number;
  platform: string;
  performerId: string;
  views: number;
  createdAt: string;
  formattedDuration?: string;
  fileUrl: string;
}

const HistoryPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/history');
      return;
    }
    
    if (status === 'authenticated') {
      fetchHistory();
    }
  }, [status, router]);
  
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/history');
      setVideos(data.history.videoIds || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load your viewing history. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemove = async (videoId: string) => {
    try {
      await HistoryService.removeFromHistory(videoId);
      setVideos(videos.filter(video => video._id !== videoId));
      toast.success('Video removed from history');
    } catch (err) {
      console.error('Error removing video:', err);
      toast.error('Failed to remove video from history');
    }
  };
  
  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear your entire viewing history?')) {
      try {
        await HistoryService.clearHistory();
        setVideos([]);
        toast.success('Viewing history cleared');
      } catch (err) {
        console.error('Error clearing history:', err);
        toast.error('Failed to clear viewing history');
      }
    }
  };
  
  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <>
      <div className="container-custom py-8">
        <PageHeader
          title="Viewing History"
          icon={<FiClock className="mr-2" />}
          description="Videos you've recently watched"
          action={
            videos.length > 0 ? (
              <button
                onClick={handleClearAll}
                className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FiTrash2 className="mr-2" />
                Clear History
              </button>
            ) : null
          }
        />
        
        {error && (
          <div className="bg-red-900/30 text-red-200 p-4 mb-6 rounded-lg flex items-center">
            <FiAlertCircle className="mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {videos.length === 0 && !loading && !error ? (
          <div className="text-center py-12">
            <FiClock size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">Your viewing history is empty</h3>
            <p className="text-gray-400 mb-6">
              Videos you watch will appear here
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors"
            >
              Browse Videos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard
                key={video._id}
                id={video._id}
                title={video.title}
                thumbnail={video.thumbnail || '/images/default-thumbnail.jpg'}
                duration={video.formattedDuration || `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`}
                views={video.views}
                date={new Date(video.createdAt).toLocaleDateString()}
                platform={video.platform}
                videoUrl={video.fileUrl || ''}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default HistoryPage; 