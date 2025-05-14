import mongoose from 'mongoose';
import { logger } from './logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/webcamrips';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let isConnected = false;

async function dbConnect(): Promise<typeof mongoose> {
  if (isConnected) {
    logger.debug('Using existing database connection');
    return mongoose;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI);
    isConnected = true;
    logger.info('Connected to MongoDB');
    return db;
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
}

export default dbConnect; 