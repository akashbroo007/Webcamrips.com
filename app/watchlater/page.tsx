'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FiClock, FiAlertCircle } from 'react-icons/fi';
import VideoCard from '@/components/video/VideoCard';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

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

const WatchLaterPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/watchlater');
      return;
    }
    
    if (status === 'authenticated') {
      fetchWatchLater();
    }
  }, [status, router]);
  
  const fetchWatchLater = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/watchlater');
      setVideos(data.watchLater.videoIds || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching watch later:', err);
      setError('Failed to load your Watch Later list. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemove = async (videoId: string) => {
    try {
      await axios.delete(`/api/watchlater?videoId=${videoId}`);
      setVideos(videos.filter(video => video._id !== videoId));
    } catch (err) {
      console.error('Error removing video:', err);
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
    <div className="container-custom py-8">
      <PageHeader
        title="Watch Later"
        icon={<FiClock className="mr-2" />}
        description="Videos you've saved to watch later"
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
          <h3 className="text-xl font-medium mb-2">Your Watch Later list is empty</h3>
          <p className="text-gray-400 mb-6">
            Start adding videos to watch them later
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
              isInWatchLater={true}
              onRemoveFromWatchLater={() => handleRemove(video._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchLaterPage; 