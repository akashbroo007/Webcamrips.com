import React from 'react';
import { notFound } from 'next/navigation';
import { FiPlay, FiClock, FiDownload } from 'react-icons/fi';
import { Metadata } from 'next';
import ExternalVideo from '@/lib/models/ExternalVideo';
import { connectDB } from '@/lib/utils/db';

interface VideoPageProps {
  params: {
    id: string;
  };
}

async function getVideo(id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/videos?id=${id}`);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

export default async function VideoPage({ params }: VideoPageProps) {
  const video = await getVideo(params.id);

  if (!video) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Video Player */}
        <div className="bg-black rounded-lg overflow-hidden mb-6">
          <div className="aspect-w-16 aspect-h-9">
            {video.gofilesUrl ? (
              <iframe
                src={video.gofilesUrl}
                className="w-full h-full"
                allowFullScreen
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-900">
                <FiPlay className="text-white text-6xl" />
              </div>
            )}
          </div>
        </div>

        {/* Video Info */}
        <div className="bg-dark rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
          <div className="flex items-center text-gray-400 text-sm mb-4">
            <span className="flex items-center mr-4">
              <FiClock className="mr-1" />
              {video.duration}
            </span>
            <span>{new Date(video.uploadDate).toLocaleDateString()}</span>
          </div>
          <p className="text-gray-300 mb-6">{video.description}</p>
          
          {/* Download Button */}
          {video.gofilesUrl && (
            <a
              href={video.gofilesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FiDownload className="mr-2" />
              Download Video
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// Generate dynamic metadata
export async function generateMetadata({ params }: VideoPageProps) {
  const { id } = params;
  
  try {
    // Fetch video data
    const video = await ExternalVideo.findById(id);
    
    if (!video || !video.isActive) {
      return {
        title: 'Video Not Found',
      };
    }
    
    return {
      title: video.title,
      description: video.description || `Watch ${video.title} from ${video.platform}`,
      openGraph: {
        title: video.title,
        description: video.description || `Watch ${video.title} from ${video.platform}`,
        images: [video.thumbnailUrl],
      },
    };
  } catch (error) {
    return {
      title: 'Video - WebcamRips',
    };
  }
} 