import { NextRequest, NextResponse } from 'next/server';
import { existsSync } from 'fs';
import path from 'path';

/**
 * API route that provides placeholders for missing images
 * 
 * @param request The incoming request
 * @param params Contains the image param from the URL
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { image: string } }
) {
  const { image } = params;
  
  // Determine image type based on filename or extension
  let placeholderPath = '/images/default-avatar.png';
  
  if (image.includes('thumbnail') || image.includes('video') || image.endsWith('.jpg') || image.endsWith('.jpeg')) {
    placeholderPath = '/images/default-thumbnail.svg';
  } else if (image.includes('avatar') || image.includes('profile') || image.includes('user')) {
    placeholderPath = '/images/default-avatar.png';
  }
  
  // Check if the placeholder image exists
  const publicDir = path.join(process.cwd(), 'public');
  const placeholderExists = existsSync(path.join(publicDir, placeholderPath.slice(1)));
  
  if (!placeholderExists) {
    // Fallback to a basic SVG if placeholder doesn't exist
    return new NextResponse(
      `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="#ddd"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#888">?</text>
      </svg>`,
      {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=86400'
        }
      }
    );
  }
  
  // Redirect to the appropriate placeholder
  return NextResponse.redirect(new URL(placeholderPath, request.url));
} 