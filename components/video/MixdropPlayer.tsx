import React from 'react';

interface MixdropPlayerProps {
  url: string;
  width?: string | number;
  height?: string | number;
  className?: string;
}

/**
 * Component to display videos hosted on Mixdrop
 */
const MixdropPlayer: React.FC<MixdropPlayerProps> = ({
  url,
  width = '100%',
  height = '500px',
  className = '',
}) => {
  // Process the URL to ensure it's in embed format
  const getEmbedUrl = (url: string): string => {
    if (!url) return '';
    
    // Clean the URL
    let cleanUrl = url.trim();
    
    // Add https if missing
    if (!cleanUrl.startsWith('https://') && !cleanUrl.startsWith('http://')) {
      cleanUrl = 'https://' + cleanUrl.replace(/^\/\//, '');
    }
    
    // Convert URL to embed format if needed
    if (cleanUrl.includes('mixdrop.co')) {
      // Already in embed format
      if (cleanUrl.includes('/e/')) {
        return cleanUrl;
      }
      
      // Extract the file reference ID
      const match = cleanUrl.match(/\/([a-zA-Z0-9]+)$/);
      if (match && match[1]) {
        return `https://mixdrop.co/e/${match[1]}`;
      }
    }
    
    return cleanUrl;
  };
  
  const embedUrl = getEmbedUrl(url);
  
  if (!embedUrl) {
    return (
      <div className={`bg-black flex items-center justify-center ${className}`} style={{ width, height }}>
        <p className="text-white">Video URL is invalid or not available</p>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <iframe
        src={embedUrl}
        width={width}
        height={height}
        frameBorder="0"
        scrolling="no"
        allowFullScreen
        title="Mixdrop Video Player"
        style={{ border: 'none' }}
      />
    </div>
  );
};

export default MixdropPlayer; 