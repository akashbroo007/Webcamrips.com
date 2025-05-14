'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface FallbackImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  width?: number;
  height?: number;
  type?: 'avatar' | 'thumbnail' | 'general';
  priority?: boolean;
  onClick?: () => void;
}

/**
 * A component that renders an image with fallback support.
 * If the image fails to load, it will display a fallback image.
 */
const FallbackImage: React.FC<FallbackImageProps> = ({
  src,
  alt,
  fallbackSrc,
  className = '',
  width = 100,
  height = 100,
  type = 'general',
  priority = false,
  onClick,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [error, setError] = useState<boolean>(false);

  // Determine the appropriate fallback based on image type
  const getFallbackSrc = () => {
    if (fallbackSrc) return fallbackSrc;
    
    switch (type) {
      case 'avatar':
        return '/images/default-avatar.svg';
      case 'thumbnail':
        return '/images/default-thumbnail.svg';
      default:
        return '/images/placeholder.svg';
    }
  };

  const handleError = () => {
    if (!error) {
      setImgSrc(getFallbackSrc());
      setError(true);
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      priority={priority}
      onClick={onClick}
    />
  );
};

export default FallbackImage; 