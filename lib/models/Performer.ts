import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPerformer extends Document {
  name: string;
  platforms: {
    platform: string;
    channelId: string;
    url: string;
  }[];
  tags: string[];
  avatarUrl?: string;
  isActive: boolean;
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PerformerSchema: Schema = new Schema(
  {
    name: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true 
    },
    platforms: [{
      platform: { 
        type: String, 
        required: true,
        enum: ['Chaturbate', 'Stripchat', 'BongaCams', 'LiveJasmin', 'MyFreeCams', 'Camsoda', 'Other'] 
      },
      channelId: { 
        type: String, 
        required: true 
      },
      url: { 
        type: String, 
        required: true 
      }
    }],
    tags: [{ 
      type: String, 
      trim: true 
    }],
    avatarUrl: { 
      type: String 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    lastSeen: { 
      type: Date 
    }
  },
  { timestamps: true }
);

// Create indexes
PerformerSchema.index({ 'platforms.platform': 1 });
PerformerSchema.index({ 'platforms.channelId': 1 });
PerformerSchema.index({ isActive: 1 });
PerformerSchema.index({ tags: 1 });

// Create or get the model
let Performer: Model<IPerformer>;

try {
  // Try to get existing model
  Performer = mongoose.model<IPerformer>('Performer');
} catch {
  // Define model if it doesn't exist
  Performer = mongoose.model<IPerformer>('Performer', PerformerSchema);
}

export default Performer; 