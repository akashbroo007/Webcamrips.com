import mongoose, { Schema, Document } from 'mongoose';

export interface IExternalVideo extends Document {
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  views?: number;
  likes?: number;
  dislikes?: number;
  uploadDate?: Date;
  isActive: boolean;
  platform: string;
  tags?: string[];
  metadata?: Record<string, any>;
  incrementViews(): Promise<IExternalVideo>;
}

const ExternalVideoSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  thumbnailUrl: {
    type: String
  },
  duration: {
    type: Number
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  uploadDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['youtube', 'vimeo', 'dailymotion', 'other']
  },
  tags: [{
    type: String
  }],
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Create indexes
ExternalVideoSchema.index({ platform: 1 });
ExternalVideoSchema.index({ isActive: 1 });

// Increment view count
ExternalVideoSchema.methods.incrementViews = function(this: IExternalVideo): Promise<IExternalVideo> {
  this.views = (this.views || 0) + 1;
  return this.save();
};

let ExternalVideo: mongoose.Model<IExternalVideo>;

try {
  // Try to get existing model
  ExternalVideo = mongoose.model<IExternalVideo>('ExternalVideo');
} catch {
  // Define model if it doesn't exist
  ExternalVideo = mongoose.model<IExternalVideo>('ExternalVideo', ExternalVideoSchema);
}

export default ExternalVideo; 