"use client"

import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiClock, FiEye } from 'react-icons/fi';

export interface VideoProps {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: number;
  date: string;
  platform: string;
  performer?: string;
  videoUrl?: string;
}

const VideoCard: FC<VideoProps> = ({ 
  id, 
  title, 
  thumbnail, 
  duration, 
  views, 
  date, 
  platform,
  performer,
  videoUrl
}) => {
  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  };

  const safeThumbnail = thumbnail || '/images/default-thumbnail.jpg';
  const safeDuration = duration || '00:00';
  const safePlatform = platform || 'Unknown';

  return (
    <div className="bg-secondary rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all">
      <div className="relative">
        {/* Thumbnail with Link */}
        <Link href={`/videos/${id}`} className="block">
          <div className="relative aspect-video bg-gray-900">
            <Image
              src={safeThumbnail}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/default-thumbnail.jpg';
              }}
            />
            
            {/* Duration badge */}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded text-xs font-medium flex items-center">
              <FiClock size={12} className="mr-1" />
              {safeDuration}
            </div>
            
            {/* Platform badge */}
            <div className="absolute top-2 left-2 bg-primary px-2 py-1 rounded text-xs font-bold">
              {safePlatform}
            </div>
          </div>
        </Link>
      </div>
      
      {/* Video info */}
      <div className="p-3">
        <Link href={`/videos/${id}`} className="block">
          <h3 className="text-white font-medium text-lg mb-2 line-clamp-2">
            {title}
          </h3>
        </Link>
        
        {performer && (
          <p className="text-gray-400 text-sm mb-2">{performer}</p>
        )}
        
        <div className="flex items-center justify-between text-gray-400 text-sm">
          <div className="flex items-center">
            <FiEye size={14} className="mr-1" />
            <span>{formatViews(views)} views</span>
          </div>
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoCard; 