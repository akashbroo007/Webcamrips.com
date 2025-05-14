import mongoose from 'mongoose';
import { databaseLogger } from './logger';
import appConfig from '../../config/app';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

const MONGODB_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  heartbeatFrequencyMS: 2000,
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  family: 4
};

/**
 * Connect to MongoDB if not already connected
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    databaseLogger.debug('Using existing database connection');
    return cached.conn;
  }
  
  if (!cached.promise) {
    databaseLogger.info('Connecting to MongoDB...');
    
    cached.promise = mongoose.connect(MONGODB_URI!, MONGODB_OPTIONS)
      .then((mongoose) => {
        databaseLogger.info('Connected to MongoDB');
        
        // Set up connection error handler
        mongoose.connection.on('error', (error) => {
          databaseLogger.error('MongoDB connection error:', error);
          cached.promise = null;
        });

        // Set up disconnection handler
        mongoose.connection.on('disconnected', () => {
          databaseLogger.warn('MongoDB disconnected');
          cached.promise = null;
        });

        // Set up reconnection handler
        mongoose.connection.on('reconnected', () => {
          databaseLogger.info('MongoDB reconnected');
        });

        return mongoose;
      })
      .catch((error) => {
        databaseLogger.error('MongoDB connection error:', error);
        cached.promise = null;
        throw error;
      });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDB(): Promise<void> {
  if (!cached.conn) {
    return; // Already disconnected
  }
  
  databaseLogger.info('Disconnecting from MongoDB...');
  
  await mongoose.disconnect();
  cached.conn = null;
  cached.promise = null;
  
  databaseLogger.info('Disconnected from MongoDB');
}

/**
 * Get current connection status
 */
export function getConnectionStatus(): string {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
}

/**
 * Initialize database connection for the application
 */
export async function initDatabase(): Promise<void> {
  try {
    await connectDB();
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await disconnectDB();
        process.exit(0);
      } catch (error) {
        process.exit(1);
      }
    });
  } catch (error) {
    databaseLogger.error('Database initialization failed:', error);
    throw error;
  }
} 