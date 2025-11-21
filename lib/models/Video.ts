import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  description?: string;
  gofilesUrl: string;
  mixdropUrl?: string;
  thumbnail?: string;
  duration: number;  // In seconds
  views: number;
  createdAt: Date;  // Changed from uploadDate to createdAt
  performer: mongoose.Types.ObjectId | string;
  tags: string[];
  isPrivate: boolean;
  platform?: string;
  contentId?: string;  // Added to store Gofile content ID
  directFileUrl?: string;  // Added to store direct file URL from Gofile API
  
  // Methods
  incrementViews: () => Promise<IVideo>;
  
  // Virtual fields
  formattedDuration?: string;
  fileUrl?: string;
}

const VideoSchema: Schema = new Schema(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String, 
      trim: true 
    },
    gofilesUrl: { 
      type: String, 
      required: true 
    },
    mixdropUrl: { 
      type: String 
    },
    thumbnail: { 
      type: String 
    },
    duration: { 
      type: Number,
      default: 0
    },
    views: { 
      type: Number, 
      default: 0 
    },
    platform: {
      type: String,
      default: 'Unknown'
    },
    performer: {
      type: Schema.Types.ObjectId,
      ref: 'Performer'
    },
    tags: [{ 
      type: String, 
      trim: true 
    }],
    isPrivate: {
      type: Boolean,
      default: false
    },
    contentId: {
      type: String,
      trim: true
    },
    directFileUrl: {
      type: String,
      trim: true
    }
  },
  { 
    timestamps: true,  // This creates createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add virtual fields for formatted values
VideoSchema.virtual('formattedDuration').get(function() {
  const seconds = this.duration || 0;
  const minutes = Math.floor(Number(seconds) / 60);
  const remainingSeconds = Math.floor(Number(seconds) % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
});

// Add fileUrl virtual
VideoSchema.virtual('fileUrl').get(function() {
  // Check for mixdrop URL first (prioritize Mixdrop)
  if (this.mixdropUrl && typeof this.mixdropUrl === 'string') {
    const mixdropUrl = this.mixdropUrl.trim();
    
    // Add https if missing
    let url = mixdropUrl;
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      url = 'https://' + url.replace(/^\/\//, '');
    }
    
    // Handle various Mixdrop URL formats
    if (url.includes('mixdrop.co')) {
      // Already in embed format
      if (url.includes('/e/') || url.includes('/f/')) {
        return url;
      } else if (url.match(/\/[a-zA-Z0-9]+$/)) {
        // Convert short URL to embed URL
        const fileRef = url.match(/\/([a-zA-Z0-9]+)$/)?.[1];
        if (fileRef) {
          return `https://mixdrop.co/e/${fileRef}`;
        }
      }
    }
    
    return url;
  }
  
  // Fallback to gofilesUrl if mixdropUrl is not available
  if (this.gofilesUrl && typeof this.gofilesUrl === 'string') {
    const gofilesUrl = this.gofilesUrl.trim();
    
    // Add https if missing
    let url = gofilesUrl;
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      url = 'https://' + url.replace(/^\/\//, '');
    }
    
    // Handle various gofile.io URL formats
    if (url.includes('gofile.io')) {
      // Convert content URL to download URL
      if (url.includes('/d/') && !url.includes('/download/')) {
        url = url.replace('/d/', '/download/');
      } 
      // If it's a shortened URL like gofile.io/abc123, convert to download URL
      else if (url.match(/\/[a-zA-Z0-9]+$/)) {
        const contentId = url.match(/\/([a-zA-Z0-9]+)$/)?.[1];
        if (contentId) {
          url = `https://gofile.io/download/${contentId}`;
        }
      }
    }
    
    return url;
  }
  
  // Check for direct file URL
  if (this.directFileUrl && typeof this.directFileUrl === 'string') {
    return this.directFileUrl;
  }
  
  // Fallback if no URLs are available
  return this._id ? `/videos/fallback/${this._id.toString()}` : null;
});

// Add view count method
VideoSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Create indexes
VideoSchema.index({ title: 'text', description: 'text' });
VideoSchema.index({ createdAt: -1 });  // Changed from uploadDate to createdAt
VideoSchema.index({ views: -1 });
VideoSchema.index({ performer: 1 });
VideoSchema.index({ platform: 1 });  // Added index for platform

// Create or get the model
let Video: Model<IVideo>;

try {
  // Try to get existing model
  Video = mongoose.model<IVideo>('Video');
} catch {
  // Define model if it doesn't exist
  Video = mongoose.model<IVideo>('Video', VideoSchema);
}

export default Video; 