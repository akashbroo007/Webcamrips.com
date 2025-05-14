import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRecording extends Document {
  modelName: string;
  platform: string;
  streamUrl: string;
  status: 'scheduled' | 'recording' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  duration: number;
  filePath?: string;
  fileSize?: number;
  uploadStatus?: 'pending' | 'uploading' | 'completed' | 'failed';
  videoId?: mongoose.Types.ObjectId;
  error?: string;
  processId?: string;
}

const RecordingSchema: Schema = new Schema(
  {
    modelName: {
      type: String,
      required: true,
      trim: true
    },
    platform: {
      type: String,
      required: true,
      enum: ['chaturbate', 'myfreecams', 'stripchat', 'bongacams', 'camsoda', 'cam4', 'streamate', 'flirt4free', 'other'],
      default: 'chaturbate'
    },
    streamUrl: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['scheduled', 'recording', 'completed', 'failed'],
      default: 'scheduled'
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: {
      type: Date
    },
    duration: {
      type: Number,
      default: 7200 // Default 2 hours in seconds
    },
    filePath: {
      type: String
    },
    fileSize: {
      type: Number
    },
    uploadStatus: {
      type: String,
      enum: ['pending', 'uploading', 'completed', 'failed']
    },
    videoId: {
      type: Schema.Types.ObjectId,
      ref: 'Video'
    },
    error: {
      type: String
    },
    processId: {
      type: String
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create indexes
RecordingSchema.index({ modelName: 1 });
RecordingSchema.index({ platform: 1 });
RecordingSchema.index({ status: 1 });
RecordingSchema.index({ startTime: -1 });

// Create or get the model
let Recording: Model<IRecording>;

try {
  // Try to get existing model
  Recording = mongoose.model<IRecording>('Recording');
} catch {
  // Define model if it doesn't exist
  Recording = mongoose.model<IRecording>('Recording', RecordingSchema);
}

export default Recording; 