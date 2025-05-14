#!/usr/bin/env node

/**
 * Database initialization script for webcamrips.com
 * 
 * This script will:
 * 1. Connect to MongoDB
 * 2. Create necessary indexes (if they don't exist)
 * 3. Create initial admin user if it doesn't exist
 * 4. Set up basic configuration data
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Get MongoDB URI from environment
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: No MONGODB_URI environment variable found!');
  console.error('Please check your .env.local file');
  process.exit(1);
}

// Connection options
const connectionOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 5
};

// Define User schema for this script
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isPremium: { type: Boolean, default: false },
  avatar: { type: String, default: '/images/default-avatar.png' },
  bio: { type: String, default: '' },
  passwordChangeRequired: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Admin user data
const adminUserData = {
  username: 'admin',
  email: 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'Admin123!', // Default password, should be changed
  isAdmin: true,
  isPremium: true,
  passwordChangeRequired: true
};

// Helper function to safely create index if it doesn't exist
async function createIndexSafely(collection, indexSpec, options = {}) {
  try {
    // Check if index exists first
    const indexExists = await collection.indexExists(indexSpec.name || indexSpec[0]);
    if (indexExists) {
      console.log(`Index ${indexSpec.name || indexSpec[0]} already exists`);
      return;
    }
    
    await collection.createIndex(indexSpec, options);
    console.log(`Created index: ${JSON.stringify(indexSpec)}`);
  } catch (error) {
    // If error is due to index already existing with different options, just log it
    if (error.code === 85) {
      console.log(`Index conflict: ${error.message}`);
    } else {
      throw error; // Rethrow other errors
    }
  }
}

async function initializeDatabase() {
  console.log('Connecting to MongoDB...');
  
  try {
    await mongoose.connect(MONGODB_URI, connectionOptions);
    console.log('✅ Connected to MongoDB');
    
    // Define models
    const User = mongoose.model('User', userSchema);
    const Video = mongoose.models.Video || mongoose.model('Video', new mongoose.Schema({
      title: String,
      description: String,
      gofilesUrl: String,
      mixdropUrl: String,
      thumbnail: String,
      duration: Number,
      platform: String,
      performer: { type: mongoose.Schema.Types.ObjectId, ref: 'Performer' },
      uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      isPrivate: Boolean,
      verified: Boolean,
      createdAt: { type: Date, default: Date.now }
    }));
    
    // Create indexes safely
    console.log('Checking and creating indexes if needed...');
    
    // Check if collections exist
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('Existing collections:', collectionNames);
    
    if (collectionNames.includes('users')) {
      try {
        await createIndexSafely(User.collection, { email: 1 }, { unique: true, name: 'email_1' });
        await createIndexSafely(User.collection, { username: 1 }, { unique: true, name: 'username_1' });
        console.log('User indexes checked');
      } catch (e) {
        console.log('Note: User indexes already exist or could not be created:', e.message);
      }
    } else {
      console.log('Users collection not found, will be created when first user is added');
    }
    
    if (collectionNames.includes('videos')) {
      try {
        await createIndexSafely(Video.collection, { title: 'text', description: 'text' }, { name: 'title_text_description_text' });
        console.log('Video indexes checked');
      } catch (e) {
        console.log('Note: Video indexes already exist or could not be created:', e.message);
      }
    } else {
      console.log('Videos collection not found, will be created when first video is added');
    }
    
    // Check if admin user exists
    const existingAdmin = await User.findOne({ email: adminUserData.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      console.log('Creating admin user...');
      const newAdmin = new User(adminUserData);
      await newAdmin.save();
      console.log('✅ Admin user created');
    }
    
    // Database initialization complete
    console.log('\n✅ Database initialization complete');
    
    // Display login information
    console.log('\nYou can now log in with:');
    console.log(`Username: ${adminUserData.username}`);
    console.log(`Email: ${adminUserData.email}`);
    console.log(`Password: ${adminUserData.password}`);
    console.log('For security, please change the admin password after first login.');
    
  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    // Disconnect from database
    try {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }
}

// Run the initialization
initializeDatabase(); 