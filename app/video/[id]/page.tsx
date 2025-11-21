"use client"

import { FC, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FiClock, FiEye, FiCalendar, FiUser, FiThumbsUp, FiThumbsDown, FiShare2, FiBookmark, FiFlag, FiLoader } from 'react-icons/fi';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import VideoCard from '@/components/video/VideoCard';
import MixdropPlayer from '@/components/video/MixdropPlayer';
import HistoryService from '@/lib/services/historyService';
import Head from 'next/head';

interface VideoData {
  _id: string;
  title: string;
  description?: string;
  embedUrl?: string;
  thumbnail?: string;
  duration?: string;
  formattedDuration?: string;
  views?: number;
  likes?: number;
  dislikes?: number;
  createdAt?: string;
  platform?: string;
  performer?: {
    _id?: string;
    name?: string;
    avatar?: string;
    followers?: number;
  };
  tags?: string[];
  fileUrl?: string;
  gofilesUrl?: string;
  mixdropUrl?: string;
  contentId?: string;
  directFileUrl?: string;
  comments?: {
    _id: string;
    user: {
      _id: string;
      name: string;
      avatar?: string;
    };
    text: string;
    date: string;
    likes: number;
  }[];
}

interface RelatedVideo {
  _id: string;
  title: string;
  thumbnail?: string;
  duration?: string;
  formattedDuration?: string;
  views?: number;
  createdAt?: string;
  platform?: string;
  fileUrl?: string;
}

const VideoPage: FC = () => {
  const pathname = usePathname();
  const { status } = useSession();
  const router = useRouter();
  
  // Extract video ID from path
  const videoId = pathname ? pathname.split('/').pop() : '';
  
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<RelatedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load CORS service worker script
  useEffect(() => {
    // Dynamically create and append the CORS service worker script
    const script = document.createElement('script');
    script.innerHTML = `
      // This is a minimal implementation of a CORS service worker to help with cross-origin issues
      (() => {
        if (typeof window === 'undefined') return;
        
        // Check if cross-origin isolation is already enabled
        const isCoepCredentialless = () => {
          return window.crossOriginIsolated === true &&
                 window.opener === null;
        };
        
        if (!isCoepCredentialless()) {
          // When cross-origin video content fails to load, we'll try to help browsers handle it
          const originalFetch = window.fetch;
          window.fetch = function(url, options) {
            // Clone the options to avoid mutation
            const newOptions = options ? {...options} : {};
            
            if (typeof url === 'string' && 
                (url.includes('gofile.io') || url.includes('mixdrop.co'))) {
              // Add no-cors mode for certain video providers that might block CORS
              newOptions.mode = 'no-cors';
              
              // For credential-requiring requests, make sure credentials are included
              if (!newOptions.credentials) {
                newOptions.credentials = 'same-origin';
              }
            }
            
            return originalFetch.call(this, url, newOptions);
          };
          
          console.log('CORS helper activated for video playback');
        }
      })();
    `;
    
    document.head.appendChild(script);
    
    return () => {
      // Clean up when component unmounts
      document.head.removeChild(script);
    };
  }, []);
  
  // Fetch video data and related videos
  useEffect(() => {
    const fetchVideoData = async () => {
      if (!videoId) {
        setError('Invalid video ID');
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/videos/${videoId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Special handling for known videos
        if (data.video._id === "6819766dbe2df1440639924b") {
          // Update URL for the fitness video that we know has issues
          data.video.fileUrl = "https://gofile.io/download/b28dec42-47f1-459d-8791-e5041a476f37";
          console.log("Applied special URL handling for Fitness video");
        }
        
        setVideoData(data.video);
        
        // Fetch related videos
        const relatedResponse = await fetch(`/api/videos/related/${videoId}`);
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          setRelatedVideos(relatedData.videos || []);
        }
      } catch (error) {
        console.error('Error fetching video:', error);
        setError('Failed to load video. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideoData();
  }, [videoId]);
  
  // Track video view in history when page loads
  useEffect(() => {
    if (status === 'authenticated' && videoId && !loading && videoData) {
      HistoryService.addToHistory(videoId);
    }
  }, [videoId, status, loading, videoData]);
  
  const formatViews = (views?: number): string => {
    if (!views) return '0 views';
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  };

  // Function to format Gofile URLs to ensure they work
  const formatGofileUrl = (url: string): string => {
    if (!url) return '';
    
    // Clean URL
    let formattedUrl = url.trim();
    
    // Add https if missing
    if (!formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl.replace(/^(http:\/\/|\/\/|)/, '');
    }
    
    // Handle gofile.io links
    if (formattedUrl.includes('gofile.io')) {
      // Convert content URL to download URL if needed
      if (formattedUrl.includes('/d/') && !formattedUrl.includes('/download/')) {
        formattedUrl = formattedUrl.replace('/d/', '/download/');
      } 
      // If it's a shortened URL like gofile.io/abc123, convert to download URL
      else if (formattedUrl.match(/\/[a-zA-Z0-9]+$/)) {
        const contentId = formattedUrl.match(/\/([a-zA-Z0-9]+)$/)?.[1];
        if (contentId) {
          formattedUrl = `https://gofile.io/download/${contentId}`;
        }
      }
    }
    
    return formattedUrl;
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="bg-dark min-h-screen py-8">
          <div className="container-custom flex justify-center items-center py-20">
            <FiLoader className="animate-spin text-primary text-3xl mr-2" />
            <span className="text-gray-400">Loading video...</span>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !videoData) {
    return (
      <>
        <Header />
        <main className="bg-dark min-h-screen py-8">
          <div className="container-custom">
            <div className="bg-error bg-opacity-20 text-error-content rounded-lg p-8 text-center">
              <h2 className="text-xl font-bold mb-2">Error</h2>
              <p>{error || 'Video not found'}</p>
              <button 
                onClick={() => router.push('/videos')}
                className="mt-4 bg-primary hover:bg-primary-dark text-white font-medium rounded px-4 py-2"
              >
                Browse videos
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="bg-dark min-h-screen py-8">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Video Content */}
            <div className="lg:col-span-2">
              {/* Video Player */}
              <div className="bg-black rounded-lg overflow-hidden relative aspect-video mb-4">
                {/* Check for Mixdrop URL first (prioritize Mixdrop) */}
                {videoData.mixdropUrl ? (
                  <MixdropPlayer 
                    url={videoData.mixdropUrl} 
                    width="100%" 
                    height="100%" 
                    className="absolute inset-0"
                  />
                ) : videoData.fileUrl ? (
                  <>
                    {/* For Gofile videos with direct file URL from API */}
                    {videoData.directFileUrl ? (
                      <video
                        key={`direct-${videoData.directFileUrl}`}
                        id="videoPlayerDirect"
                        src={videoData.directFileUrl}
                        controls
                        autoPlay
                        className="w-full h-full"
                        poster={videoData.thumbnail}
                        onError={(e) => {
                          console.error("Direct video URL failed:", videoData.directFileUrl);
                          
                          // Hide the video element that failed
                          const videoElement = e.currentTarget;
                          videoElement.style.display = 'none';
                          
                          // Try iframe fallback with content ID
                          if (videoData.contentId) {
                            const container = videoElement.parentNode;
                            if (container) {
                              const iframe = document.createElement('iframe');
                              iframe.src = `https://gofile.io/embedContent/${videoData.contentId}`;
                              iframe.className = 'absolute inset-0 w-full h-full border-0';
                              iframe.frameBorder = '0';
                              iframe.allowFullscreen = true;
                              iframe.title = videoData.title || 'Video content';
                              
                              container.appendChild(iframe);
                              console.log("Fallback to iframe player:", iframe.src);
                            }
                          } else {
                            // Show error message if no iframe fallback is possible
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'absolute inset-0 flex flex-col items-center justify-center bg-black p-4';
                            
                            const errorMessage = document.createElement('p');
                            errorMessage.className = 'text-white text-center mb-4';
                            errorMessage.textContent = 'Error loading video. The file may be unavailable or in an unsupported format.';
                            errorDiv.appendChild(errorMessage);
                            
                            if (videoData.gofilesUrl) {
                              const openButton = document.createElement('a');
                              openButton.href = videoData.gofilesUrl;
                              openButton.target = '_blank';
                              openButton.className = 'bg-primary hover:bg-primary-dark text-white font-medium rounded px-4 py-2';
                              openButton.textContent = 'Open in Gofile';
                              errorDiv.appendChild(openButton);
                            }
                            
                            if (videoElement.parentNode) {
                              videoElement.parentNode.appendChild(errorDiv);
                            }
                          }
                        }}
                      />
                    ) : (
                      /* For Gofile videos, use iframe embedding which works better if no direct URL */
                      (videoData.gofilesUrl?.includes('gofile.io') || videoData._id === "6819766dbe2df1440639924b") ? (
                        <div className="relative w-full h-full">
                          {(() => {
                            let contentId = videoData.contentId || "";
                            
                            if (!contentId && videoData.gofilesUrl) {
                              if (videoData.gofilesUrl.includes('/download/')) {
                                contentId = videoData.gofilesUrl.split('/download/')[1].split('/')[0];
                              } else if (videoData.gofilesUrl.includes('/d/')) {
                                contentId = videoData.gofilesUrl.split('/d/')[1].split('/')[0];
                              } else if (videoData.gofilesUrl.match(/\/[a-zA-Z0-9-]+$/)) {
                                contentId = videoData.gofilesUrl.match(/\/([a-zA-Z0-9-]+)$/)?.[1] || "";
                              }
                            }
                            
                            // Special case for the fitness video which we know had issues
                            if (videoData._id === "6819766dbe2df1440639924b") {
                              contentId = "b28dec42-47f1-459d-8791-e5041a476f37";
                            }
                            
                            if (contentId) {
                              return (
                                <iframe
                                  src={`https://gofile.io/embedContent/${contentId}`}
                                  className="absolute inset-0 w-full h-full border-0"
                                  frameBorder="0"
                                  allowFullScreen
                                  title={videoData.title}
                                ></iframe>
                              );
                            } else {
                              // If we couldn't extract a content ID
                              return (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
                                  <p className="text-white text-center mb-4">Direct video playback not available</p>
                                  {videoData.gofilesUrl && (
                                    <a
                                      href={videoData.gofilesUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="bg-primary hover:bg-primary-dark text-white font-medium rounded px-4 py-2"
                                    >
                                      Open in Gofile
                                    </a>
                                  )}
                                </div>
                              );
                            }
                          })()}
                        </div>
                      ) : (
                        // For non-Gofile videos, try direct video playback
                        <video
                          key={`video-${videoData.fileUrl}`}
                          id="videoPlayer"
                          src={videoData.fileUrl}
                          controls
                          autoPlay
                          className="w-full h-full"
                          poster={videoData.thumbnail}
                          onError={(e) => {
                            console.error("Video load error:", videoData.fileUrl);
                            // Handle video load error
                            const videoElement = e.currentTarget;
                            videoElement.style.display = 'none';
                            
                            // Create error message container
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'absolute inset-0 flex flex-col items-center justify-center bg-black p-4';
                            
                            // Add error message
                            const errorMessage = document.createElement('p');
                            errorMessage.className = 'text-white text-center mb-4';
                            errorMessage.textContent = 'Error loading video. The file may be unavailable or in an unsupported format.';
                            errorDiv.appendChild(errorMessage);
                            
                            // Add open in new tab button
                            if (videoData.fileUrl) {
                              const openButton = document.createElement('a');
                              openButton.href = videoData.fileUrl;
                              openButton.target = '_blank';
                              openButton.className = 'bg-primary hover:bg-primary-dark text-white font-medium rounded px-4 py-2';
                              openButton.textContent = 'Open Video in New Tab';
                              errorDiv.appendChild(openButton);
                            }
                            
                            // Add to DOM
                            if (videoElement.parentNode) {
                              videoElement.parentNode.appendChild(errorDiv);
                            }
                          }}
                        />
                      )
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <p className="text-white">Video unavailable</p>
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="bg-secondary rounded-lg p-4 mb-6">
                <h1 className="text-2xl font-bold mb-2">{videoData.title}</h1>
                
                <div className="flex flex-wrap justify-between items-center text-gray-400 text-sm mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <FiEye className="mr-1" />
                      {formatViews(videoData.views)} views
                    </span>
                    {videoData.formattedDuration && (
                      <span className="flex items-center">
                        <FiClock className="mr-1" />
                        {videoData.formattedDuration}
                      </span>
                    )}
                    <span className="flex items-center">
                      <FiCalendar className="mr-1" />
                      {formatDate(videoData.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 mt-2 md:mt-0">
                    <button className="flex items-center text-gray-300 hover:text-primary">
                      <FiThumbsUp className="mr-1" />
                      {videoData.likes || 0}
                    </button>
                    <button className="flex items-center text-gray-300 hover:text-primary">
                      <FiThumbsDown className="mr-1" />
                      {videoData.dislikes || 0}
                    </button>
                    <button className="flex items-center text-gray-300 hover:text-primary">
                      <FiShare2 className="mr-1" />
                      Share
                    </button>
                    <button className="flex items-center text-gray-300 hover:text-primary">
                      <FiBookmark className="mr-1" />
                      Save
                    </button>
                    <button className="flex items-center text-gray-300 hover:text-primary">
                      <FiFlag className="mr-1" />
                      Report
                    </button>
                  </div>
                </div>

                {/* Platform Badge */}
                {videoData.platform && (
                  <div className="inline-block bg-primary px-3 py-1 rounded text-sm font-bold mb-4">
                    {videoData.platform}
                  </div>
                )}

                {/* Performer Info */}
                {videoData.performer && (
                  <div className="flex items-center mb-4 p-3 bg-gray-800 rounded-lg">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden mr-3">
                      <Image
                        src={videoData.performer.avatar || "/images/default-avatar.jpg"}
                        alt={videoData.performer.name || "Unknown performer"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      {videoData.performer._id ? (
                        <Link href={`/performer/${videoData.performer._id}`} className="font-medium text-white hover:text-primary">
                          {videoData.performer.name || "Unknown performer"}
                        </Link>
                      ) : (
                        <span className="font-medium text-white">{videoData.performer.name || "Unknown performer"}</span>
                      )}
                      {videoData.performer.followers !== undefined && (
                        <p className="text-sm text-gray-400">{formatViews(videoData.performer.followers)} followers</p>
                      )}
                    </div>
                    <button className="btn-primary text-sm">
                      Follow
                    </button>
                  </div>
                )}

                {/* Description */}
                {videoData.description && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-gray-300">{videoData.description}</p>
                  </div>
                )}

                {/* Tags */}
                {videoData.tags && videoData.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {videoData.tags.map((tag, index) => (
                        <Link 
                          key={index} 
                          href={`/tag/${tag}`}
                          className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm transition-colors"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Comments Section */}
              {videoData.comments && videoData.comments.length > 0 ? (
                <div className="bg-secondary rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Comments ({videoData.comments.length})</h3>
                  
                  {/* Comment Form */}
                  <div className="flex mb-6">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                      <Image
                        src="/images/default-avatar.jpg"
                        alt="Your Avatar"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <textarea 
                        placeholder="Add a comment..." 
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        rows={3}
                      ></textarea>
                      <div className="mt-2 flex justify-end">
                        <button className="btn-primary">
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Comments */}
                  <div className="space-y-4">
                    {videoData.comments.map(comment => (
                      <div key={comment._id} className="flex">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                          <Image
                            src={comment.user.avatar || "/images/default-avatar.jpg"}
                            alt={comment.user.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <h4 className="font-medium text-white mr-2">{comment.user.name}</h4>
                            <span className="text-xs text-gray-400">{formatDate(comment.date)}</span>
                          </div>
                          <p className="text-gray-300 mb-2">{comment.text}</p>
                          <div className="flex items-center text-sm text-gray-400">
                            <button className="flex items-center hover:text-primary mr-3">
                              <FiThumbsUp className="mr-1" /> {comment.likes}
                            </button>
                            <button className="flex items-center hover:text-primary mr-3">
                              <FiThumbsDown className="mr-1" />
                            </button>
                            <button className="flex items-center hover:text-primary">
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-secondary rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Comments (0)</h3>
                  
                  {/* Comment Form */}
                  <div className="flex mb-6">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                      <Image
                        src="/images/default-avatar.jpg"
                        alt="Your Avatar"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <textarea 
                        placeholder="Be the first to comment..." 
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        rows={3}
                      ></textarea>
                      <div className="mt-2 flex justify-end">
                        <button className="btn-primary">
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-center text-gray-400">No comments yet</p>
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <div>
              <div className="bg-secondary rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold mb-4">Related Videos</h3>
                
                <div className="space-y-4">
                  {relatedVideos.length > 0 ? (
                    relatedVideos.map(video => (
                      <VideoCard
                        key={video._id}
                        id={video._id}
                        title={video.title}
                        thumbnail={video.thumbnail}
                        duration={video.formattedDuration || video.duration}
                        views={video.views || 0}
                        date={formatDate(video.createdAt)}
                        platform={video.platform}
                        videoUrl={video.fileUrl || ''}
                      />
                    ))
                  ) : (
                    <p className="text-center text-gray-400 py-4">No related videos found</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default VideoPage; 