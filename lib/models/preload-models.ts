/**
 * This file is used to preload models in Next.js server components
 * Import this file at the top of server components or API routes that need to use models
 */

import mongoose from 'mongoose';

// Only import the index once to avoid duplicate model declarations
import models, { getRegisteredModels } from './index';

// Export the imported models for use in components
export { 
  User,
  Video,
  Performer,
  Recording,
  RecentlyViewed,
  WatchLater,
  ExternalVideo,
  RecordingConfig
} from './index';

// Check if models are loaded
const loadedModels = getRegisteredModels();

if (process.env.NODE_ENV !== 'production') {
  console.log('Preloaded models:', loadedModels);
}

export default models; 