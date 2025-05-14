import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { FiClock, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface WatchLaterButtonProps {
  videoId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isInWatchLater?: boolean;
}

const WatchLaterButton = ({ 
  videoId, 
  size = 'md', 
  className = '',
  isInWatchLater = false,
}: WatchLaterButtonProps) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [inWatchLater, setInWatchLater] = useState(isInWatchLater);
  
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
  
  const buttonClass = `
    flex items-center justify-center rounded-full
    ${size === 'sm' ? 'p-1.5' : size === 'lg' ? 'p-3' : 'p-2'}
    ${inWatchLater ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800 hover:bg-gray-700'}
    text-white transition-colors duration-200
    ${className}
  `;
  
  const handleClick = async () => {
    if (!session) {
      toast.error('Please log in to add videos to your Watch Later list');
      return;
    }
    
    setLoading(true);
    
    try {
      if (inWatchLater) {
        // Remove from watch later
        await axios.delete(`/api/watchlater?videoId=${videoId}`);
        setInWatchLater(false);
        toast.success('Removed from Watch Later');
      } else {
        // Add to watch later
        await axios.post('/api/watchlater', { videoId });
        setInWatchLater(true);
        toast.success('Added to Watch Later');
      }
    } catch (error) {
      toast.error('Error updating Watch Later');
      console.error('Watch Later error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button
      className={buttonClass}
      onClick={handleClick}
      disabled={loading}
      title={inWatchLater ? 'Remove from Watch Later' : 'Add to Watch Later'}
    >
      {loading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : inWatchLater ? (
        <FiCheck size={iconSize} />
      ) : (
        <FiClock size={iconSize} />
      )}
    </button>
  );
};

export default WatchLaterButton; 