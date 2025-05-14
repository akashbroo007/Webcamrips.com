import mongoose, { Schema, Document, Types, Model } from 'mongoose';

export interface IRecordingConfig extends Document {
  _id: Types.ObjectId;
  modelName: string;
  platform: string;
  streamUrl: string;
  isActive: boolean;
  recordingQuality: string;
  cloudStorage: {
    provider: string;
    bucket: string;
    path: string;
  };
  schedule: {
    startTime?: string;
    endTime?: string;
    daysOfWeek?: number[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const RecordingConfigSchema: Schema = new Schema({
  modelName: { type: String, required: true },
  platform: { type: String, required: true, enum: ['stripchat', 'chaturbate', 'youtube'] },
  streamUrl: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  recordingQuality: { type: String, default: 'auto' },
  cloudStorage: {
    provider: { type: String, required: true, enum: ['s3', 'gcs', 'azure'] },
    bucket: { type: String, required: true },
    path: { type: String, required: true }
  },
  schedule: {
    startTime: { type: String },
    endTime: { type: String },
    daysOfWeek: [{ type: Number, min: 0, max: 6 }]
  }
}, {
  timestamps: true
});

// Export model - prevent overwrite errors with models check
let RecordingConfig: Model<IRecordingConfig>;
try {
  // Try to use existing model first
  RecordingConfig = mongoose.model<IRecordingConfig>('RecordingConfig');
} catch {
  // Create new model if it doesn't exist
  RecordingConfig = mongoose.model<IRecordingConfig>('RecordingConfig', RecordingConfigSchema);
}

export default RecordingConfig; 