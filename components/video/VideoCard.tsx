"use client"

import { FC, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiClock, FiEye } from 'react-icons/fi';
import { motion } from 'framer-motion';
import WatchLaterButton from './WatchLaterButton';

export interface VideoProps {
  id: string;
  title: string;
  thumbnail?: string;
  duration?: string;
  views?: number;
  date?: string;
  platform?: string;
  performer?: string;
  videoUrl?: string;
  isInWatchLater?: boolean;
  onRemoveFromWatchLater?: () => void;
}

// Simple formatter function to avoid recreating the function on each render
const formatViewCount = (views: number): string => {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + 'M';
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'K';
  }
  return views.toString();
};

const VideoCard: FC<VideoProps> = ({ 
  id, 
  title, 
  thumbnail, 
  duration = "00:00", 
  views = 0, 
  date = "Unknown", 
  platform = "Unknown",
  performer,
  videoUrl,
  isInWatchLater = false,
  onRemoveFromWatchLater
}) => {
  // Use the memoized formatter to avoid unnecessary recalculations
  const formattedViews = formatViewCount(views);

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-secondary rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all"
      layout="position"
    >
      <div className="relative">
        {/* Thumbnail with Link */}
        <Link href={`/video/${id}`} className="block">
          <div className="relative aspect-video bg-gray-900">
            <Image
              src={thumbnail || "/images/placeholder.svg"}
              alt={title || "Video thumbnail"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
              priority={false}
            />
            
            {/* Duration badge */}
            {duration && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded text-xs font-medium flex items-center">
                <FiClock size={12} className="mr-1" />
                {duration}
              </div>
            )}
            
            {/* Platform badge */}
            {platform && (
              <div className="absolute top-2 left-2 bg-primary px-2 py-1 rounded text-xs font-bold">
                {platform}
              </div>
            )}
          </div>
        </Link>
          
        {/* Watch Later button */}
        <div className="absolute top-2 right-2">
          <WatchLaterButton 
            videoId={id} 
            size="sm" 
            isInWatchLater={isInWatchLater}
          />
        </div>
      </div>
      
      {/* Video info */}
      <div className="p-4">
        <Link href={`/video/${id}`} className="block">
          <h3 className="text-white font-medium text-lg mb-2 line-clamp-2">
            {title || "Untitled Video"}
          </h3>
        </Link>
        
        {performer && (
          <p className="text-gray-400 text-sm mb-2">{performer}</p>
        )}
        
        <div className="flex items-center justify-between text-gray-400 text-sm">
          <div className="flex items-center">
            <FiEye size={14} className="mr-1" />
            <span>{formattedViews} views</span>
          </div>
          <span>{date}</span>
        </div>
      </div>
    </motion.div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(VideoCard); 