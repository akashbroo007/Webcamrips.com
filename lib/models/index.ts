// This file imports and exports all models to ensure they are registered with Mongoose
// This solves the "MissingSchemaError: Schema hasn't been registered" issue

// Import all models
import User from './User';
import Video from './Video';
import Performer from './Performer';
import Recording from './Recording';
import RecentlyViewed from './RecentlyViewed';
import WatchLater from './WatchLater';
import ExternalVideo from './ExternalVideo';
import RecordingConfig from './RecordingConfig';

// Export all models
export {
  User,
  Video,
  Performer,
  Recording,
  RecentlyViewed,
  WatchLater,
  ExternalVideo,
  RecordingConfig
};

// Export a function to check if models are registered
export function getRegisteredModels(): string[] {
  return Object.keys(require('mongoose').models);
}

// Export default object with all models
const models = {
  User,
  Video, 
  Performer,
  Recording,
  RecentlyViewed,
  WatchLater,
  ExternalVideo,
  RecordingConfig
};

// Log registered models in development
if (process.env.NODE_ENV !== 'production') {
  console.log('All models loaded:', getRegisteredModels());
}

export default models; 