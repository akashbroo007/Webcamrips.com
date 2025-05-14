import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRecentlyViewed extends Document {
  userId: mongoose.Types.ObjectId | string;
  videoIds: mongoose.Types.ObjectId[] | string[];
  createdAt: Date;
  updatedAt: Date;
}

const RecentlyViewedSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    videoIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Video',
    }],
  },
  { timestamps: true }
);

// Ensure videoIds array doesn't exceed 50 items (limit for recently viewed)
RecentlyViewedSchema.pre('save', function(this: IRecentlyViewed, next) {
  if (this.videoIds.length > 50) {
    // Keep only the 50 most recent (newest first)
    this.videoIds = this.videoIds.slice(0, 50);
  }
  next();
});

// Create indexes
// Note: userId index is already created by unique: true above

// Create or get the model
let RecentlyViewed: Model<IRecentlyViewed>;

try {
  // Try to get existing model
  RecentlyViewed = mongoose.model<IRecentlyViewed>('RecentlyViewed');
} catch {
  // Define model if it doesn't exist
  RecentlyViewed = mongoose.model<IRecentlyViewed>('RecentlyViewed', RecentlyViewedSchema);
}

export default RecentlyViewed; 