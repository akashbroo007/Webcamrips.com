import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Connection options with improved settings for reliability
const options = {
  connectTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 45000, // 45 seconds
  serverSelectionTimeoutMS: 15000, // 15 seconds
  heartbeatFrequencyMS: 10000, // 10 seconds (faster heartbeats)
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 1, // Keep at least 1 connection alive
  maxIdleTimeMS: 60000, // Close idle connections after 60 seconds
  retryWrites: true,
  retryReads: true,
  w: 'majority', // Ensure writes are acknowledged by a majority of nodes
  forceServerObjectId: false, // Allow Mongoose to generate ObjectIds on the client
  autoIndex: process.env.NODE_ENV !== 'production', // Don't build indexes in production
};

async function connectDB() {
  if (cached.conn) {
    console.log('Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true, // Buffer commands when connection is lost
      ...options
    };

    console.log('Connecting to MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ Successfully connected to MongoDB');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

// Add an event listener for connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  // If the connection fails, attempt to reconnect
  if (cached.conn) {
    console.log('Connection attempt failed, will retry...');
    cached.conn = null;
    cached.promise = null;
  }
});

// Add an event listener for disconnection
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected, attempting to reconnect...');
  cached.conn = null;
  cached.promise = null;
});

// Handle process termination
process.on('SIGINT', async () => {
  if (cached.conn) {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
  }
});

export default connectDB; 