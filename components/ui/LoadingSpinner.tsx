import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
}

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary' 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };
  
  const colorClasses = {
    primary: 'border-primary/30 border-t-primary',
    white: 'border-white/30 border-t-white',
    gray: 'border-gray-600/30 border-t-gray-600',
  };
  
  return (
    <div 
      className={`
        animate-spin rounded-full
        ${sizeClasses[size]}
        ${colorClasses[color]}
      `}
      aria-label="Loading"
    />
  );
};

export default LoadingSpinner; 