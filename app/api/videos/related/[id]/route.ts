import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Video } from '@/lib/models';

// Preload all models to avoid MissingSchemaError
import '@/lib/models/preload-models';

export const dynamic = 'force-dynamic'; // Default is auto
export const revalidate = 60; // revalidate at most once per minute

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const videoId = params.id;
    
    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // First, get the current video to find related by performer or tags
    const currentVideo = await Video.findById(videoId).lean();
    
    if (!currentVideo) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }
    
    // Build query for related videos
    const query: any = {
      _id: { $ne: videoId } // Exclude current video
    };
    
    // If the video has a performer, prioritize videos from same performer
    if (currentVideo.performer) {
      query.performer = currentVideo.performer;
    }
    
    // Limit and get recent videos by same performer
    const samePerformerVideos = await Video.find(query)
      .sort({ createdAt: -1 })
      .limit(10)
      .select('_id title thumbnail duration views createdAt platform')
      .lean();
    
    // If we have enough videos, return them
    if (samePerformerVideos.length >= 10) {
      return NextResponse.json({ videos: samePerformerVideos });
    }
    
    // If not enough videos from same performer, find videos with similar tags
    let relatedVideos = [...samePerformerVideos];
    
    if (currentVideo.tags && currentVideo.tags.length > 0) {
      const tagsQuery: any = {
        _id: { $ne: videoId },
        tags: { $in: currentVideo.tags }
      };
      
      // If we have related videos already, exclude them
      if (relatedVideos.length > 0) {
        // Using any type to avoid TypeScript error with MongoDB operators
        (tagsQuery._id as any).$nin = relatedVideos.map(v => v._id);
      }
      
      const taggedVideos = await Video.find(tagsQuery)
        .sort({ createdAt: -1 })
        .limit(10 - relatedVideos.length)
        .select('_id title thumbnail duration views createdAt platform')
        .lean();
        
      relatedVideos = [...relatedVideos, ...taggedVideos];
    }
    
    // If still not enough, get random recent videos
    if (relatedVideos.length < 10) {
      const excludeIds = [...relatedVideos.map(v => v._id), videoId];
      
      const randomVideos = await Video.find({ _id: { $nin: excludeIds } })
        .sort({ createdAt: -1 })
        .limit(10 - relatedVideos.length)
        .select('_id title thumbnail duration views createdAt platform')
        .lean();
        
      relatedVideos = [...relatedVideos, ...randomVideos];
    }
    
    // Add fileUrl to each video
    relatedVideos.forEach(video => {
      // Special case for specific videos
      if (video._id.toString() === "6819766dbe2df1440639924b") {
        // Hardcode the direct download URL for the fitness video
        video.fileUrl = "https://gofile.io/download/b28dec42-47f1-459d-8791-e5041a476f37";
        return;  // Skip the rest of processing for this video
      }
      
      // Process file URLs (similar to the implementation in the Video model virtual)
      if (video.gofilesUrl) {
        let url = video.gofilesUrl;
        if (!url.startsWith('https://')) {
          url = 'https://' + url.replace(/^(http:\/\/|\/\/|)/, '');
        }
        if (url.includes('gofile.io') && url.includes('/d/') && !url.includes('/download/')) {
          url = url.replace('/d/', '/download/');
        }
        video.fileUrl = url;
      } else if (video.mixdropUrl) {
        video.fileUrl = video.mixdropUrl;
      } else {
        video.fileUrl = `/videos/fallback/${video._id}`;
      }
    });
    
    return NextResponse.json({ videos: relatedVideos });
  } catch (error) {
    console.error('Error fetching related videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related videos' },
      { status: 500 }
    );
  }
} 