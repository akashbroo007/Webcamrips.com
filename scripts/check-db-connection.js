#!/usr/bin/env node

/**
 * Script to verify database connection and display collection data
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Get MongoDB URI from environment
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: No MONGODB_URI environment variable found!');
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

async function checkDatabaseConnection() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, connectionOptions);
    console.log('✅ Successfully connected to MongoDB');

    // Get collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Get count of documents in users collection
    const usersCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log(`\nUsers in database: ${usersCount}`);

    // Get a sample user (without password)
    if (usersCount > 0) {
      const sampleUser = await mongoose.connection.db.collection('users')
        .findOne({}, { projection: { password: 0 } });
      console.log('\nSample user:');
      console.log(sampleUser);
    }

    // Get count of videos
    const videosCount = await mongoose.connection.db.collection('videos').countDocuments();
    console.log(`\nVideos in database: ${videosCount}`);

    // Get a sample video
    if (videosCount > 0) {
      const sampleVideo = await mongoose.connection.db.collection('videos').findOne({});
      console.log('\nSample video:');
      console.log(sampleVideo);
    }

    console.log('\n✅ Database connection check complete');
    console.log('Your application is using the real MongoDB database');

  } catch (error) {
    console.error('❌ Database connection check failed:', error);
  } finally {
    try {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
    process.exit(0);
  }
}

// Run the check
checkDatabaseConnection(); 