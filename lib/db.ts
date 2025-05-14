import mongoose from 'mongoose';

// Import all models to ensure they're registered
import './models/preload-models';

// Apply TLS patch for Node.js to fix SSL issues with MongoDB Atlas
try {
  // Only apply in development environment to avoid security risks in production
  if (process.env.NODE_ENV !== 'production') {
    // @ts-ignore - This is a low-level patch to fix TLS issues
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }
} catch (error) {
  console.warn('Could not apply TLS patch:', error);
}

const MONGODB_URI = process.env.MONGODB_URI;
const MOCK_MODE = process.env.MOCK_MODE === 'true';
const DB_RETRY_ATTEMPTS = Number(process.env.DB_RETRY_ATTEMPTS) || 5;
const DB_RETRY_DELAY = Number(process.env.DB_RETRY_DELAY) || 2000;

// Global flag to indicate if we're in mock mode
let isMockMode = MOCK_MODE;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  isConnecting: boolean;
  connectionAttempts: number;
}

declare global {
  var mongooseMain: MongooseCache | undefined;
  var isMockMode: boolean | undefined;
}

let cached = global.mongooseMain || { 
  conn: null, 
  promise: null, 
  isConnecting: false,
  connectionAttempts: 0
};

if (!global.mongooseMain) {
  global.mongooseMain = cached;
}

// Use environment variable for max connection attempts
const MAX_CONNECTION_ATTEMPTS = DB_RETRY_ATTEMPTS;

async function connectDB() {
  // If mock mode is explicitly enabled, just use that
  if (MOCK_MODE) {
    console.log('Running in MOCK mode (explicitly configured). No database connection will be established.');
    isMockMode = true;
    global.isMockMode = true;
    return null;
  }

  // If we already have a connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If connection is in progress, wait for it
  if (cached.isConnecting) {
    try {
      return await cached.promise;
    } catch (error) {
      console.error('Error while waiting for existing connection:', error);
      cached.isConnecting = false;
    }
  }

  // Increment connection attempts
  cached.connectionAttempts++;
  
  // After MAX_CONNECTION_ATTEMPTS, fall back to mock mode, but still try to connect in the background
  if (cached.connectionAttempts > MAX_CONNECTION_ATTEMPTS) {
    console.log(`Exceeded ${MAX_CONNECTION_ATTEMPTS} connection attempts, temporarily using mock data while still trying to connect...`);
    isMockMode = true;
    global.isMockMode = true;
  }

  // Setup connection options with reasonable timeouts for production
  const opts = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    maxPoolSize: 10,
    minPoolSize: 5,
    ssl: true,
    tls: true
  };

  // Set connection state
  cached.isConnecting = true;

  // Try to connect to MongoDB
  cached.promise = mongoose.connect(MONGODB_URI!, opts)
    .then((mongoose) => {
      console.log('✅ Successfully connected to MongoDB');
      isMockMode = false;
      global.isMockMode = false;
      cached.isConnecting = false;
      cached.connectionAttempts = 0; // Reset counter on successful connection

      // Add connection event listeners for better stability
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        // Mark connection as needing refresh
        cached.conn = null; 
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected, will attempt to reconnect automatically');
        cached.conn = null;
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected successfully');
      });

      return mongoose;
    })
    .catch((error) => {
      console.error('MongoDB connection error details:', error.name, error.message);
      if (error.name === 'MongoServerSelectionError') {
        console.error('Cannot connect to MongoDB server. Please check:');
        console.error('1. Your network connection');
        console.error('2. MongoDB Atlas IP allowlist (your current IP may not be allowed)');
        console.error('3. MongoDB Atlas credentials');
        console.error('4. TLS/SSL certificate settings');
      }
      
      if (cached.connectionAttempts > MAX_CONNECTION_ATTEMPTS) {
        console.log('Using mock data temporarily due to connection issues. Will continue trying in the background.');
        isMockMode = true;
        global.isMockMode = true;
      } else {
        console.log(`Connection attempt ${cached.connectionAttempts} of ${MAX_CONNECTION_ATTEMPTS} failed, will retry...`);
        isMockMode = false;
        global.isMockMode = false;
      }
      
      cached.isConnecting = false;
      cached.promise = null;
      
      // Schedule another connection attempt with configurable delay
      setTimeout(() => {
        console.log('Attempting to reconnect to MongoDB...');
        connectDB().catch(err => console.error('Reconnection attempt failed:', err));
      }, DB_RETRY_DELAY);
      
      return mongoose;
    });

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    cached.isConnecting = false;
    
    if (cached.connectionAttempts > MAX_CONNECTION_ATTEMPTS) {
      isMockMode = true;
      global.isMockMode = true;
      console.error('Error connecting to MongoDB, temporarily using mock data:', e);
    }
    
    return null;
  }
}

export default connectDB;

// Export a function to check if we're in mock mode
export function isInMockMode() {
  return isMockMode;
}

export async function disconnectDB() {
  if (!cached.conn) {
    return;
  }

  try {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    cached.isConnecting = false;
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
} 