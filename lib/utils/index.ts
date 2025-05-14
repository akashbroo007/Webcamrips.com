import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with Tailwind's class merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Only import server-side modules if not running in the browser
if (typeof window === 'undefined') {
  // These imports will only be included in server-side bundles
  require('./logger');
  require('./helpers');
  require('./paths');
  require('./db');
  require('./database');
  require('./ffmpeg');
  require('./recorder');
}

// Export client-safe functions directly
export * from './helpers'; 