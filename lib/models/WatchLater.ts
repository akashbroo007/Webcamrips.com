import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWatchLater extends Document {
  userId: mongoose.Types.ObjectId | string;
  videoIds: mongoose.Types.ObjectId[] | string[];
  createdAt: Date;
  updatedAt: Date;
}

const WatchLaterSchema: Schema = new Schema(
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

// Ensure videoIds array doesn't exceed 100 items (requirement from spec)
WatchLaterSchema.pre('save', function(this: IWatchLater, next) {
  if (this.videoIds.length > 100) {
    this.videoIds = this.videoIds.slice(-100); // Keep only the 100 most recent
  }
  next();
});

// Create indexes
// Note: userId index is already created by unique: true above

// Create or get the model
let WatchLater: Model<IWatchLater>;

try {
  // Try to get existing model
  WatchLater = mongoose.model<IWatchLater>('WatchLater');
} catch {
  // Define model if it doesn't exist
  WatchLater = mongoose.model<IWatchLater>('WatchLater', WatchLaterSchema);
}

export default WatchLater; 