#!/usr/bin/env node

/**
 * Script to add sample data to the database
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

// Define schemas
const performerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '/images/default-performer.jpg' },
  isActive: { type: Boolean, default: true },
  platforms: [{
    platform: String,
    channelId: String,
    url: String
  }],
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  gofilesUrl: { type: String },
  mixdropUrl: { type: String },
  thumbnail: { type: String, default: '/images/default-thumbnail.jpg' },
  duration: { type: Number, default: 0 },
  platform: { type: String, default: 'Unknown' },
  performer: { type: mongoose.Schema.Types.ObjectId, ref: 'Performer' },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPrivate: { type: Boolean, default: false },
  verified: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Sample data
const samplePerformers = [
  {
    name: 'Sophia Rose',
    bio: 'Fitness enthusiast and model from Los Angeles',
    avatar: '/images/performers/sophia.jpg',
    platforms: [
      {
        platform: 'Chaturbate',
        channelId: 'sophia_rose',
        url: 'https://chaturbate.com/sophia_rose/'
      }
    ],
    tags: ['fitness', 'model', 'blonde']
  },
  {
    name: 'Luna Star',
    bio: 'Glamour model from Miami',
    avatar: '/images/performers/luna.jpg',
    platforms: [
      {
        platform: 'Stripchat',
        channelId: 'luna_star',
        url: 'https://stripchat.com/luna_star'
      }
    ],
    tags: ['glamour', 'brunette', 'latina']
  }
];

const sampleVideos = [
  {
    title: 'Fitness Workout Session',
    description: 'Sophia demonstrating her fitness routine',
    gofilesUrl: 'https://gofile.io/d/abcdef',
    mixdropUrl: 'https://mixdrop.co/f/123456',
    thumbnail: '/images/thumbnails/fitness.jpg',
    duration: 1200, // 20 minutes
    platform: 'Chaturbate',
    isPrivate: false,
    verified: true,
    views: 254
  },
  {
    title: 'Glamour Photoshoot Behind the Scenes',
    description: 'Luna showing her glamour photoshoot process',
    gofilesUrl: 'https://gofile.io/d/ghijkl',
    mixdropUrl: 'https://mixdrop.co/f/789012',
    thumbnail: '/images/thumbnails/glamour.jpg',
    duration: 1800, // 30 minutes
    platform: 'Stripchat',
    isPrivate: false,
    verified: true,
    views: 412
  }
];

async function addSampleData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, connectionOptions);
    console.log('✅ Successfully connected to MongoDB');

    // Create models
    const Performer = mongoose.model('Performer', performerSchema);
    const Video = mongoose.model('Video', videoSchema);
    const User = mongoose.model('User', {});  // We just need the model to find admin user

    // Find admin user to set as uploader
    const adminUser = await User.findOne({ isAdmin: true });
    
    if (!adminUser) {
      console.error('❌ Admin user not found. Please run initialize-db.js first.');
      process.exit(1);
    }

    // Check if we already have sample data
    const existingPerformers = await Performer.countDocuments();
    const existingVideos = await Video.countDocuments();

    if (existingPerformers > 0 && existingVideos > 0) {
      console.log('Sample data already exists in the database.');
      console.log(`Performers: ${existingPerformers}, Videos: ${existingVideos}`);
      
      // Display data
      const performers = await Performer.find({});
      const videos = await Video.find({});
      
      console.log('\nExisting performers:');
      performers.forEach(p => console.log(`- ${p.name} (${p._id})`));
      
      console.log('\nExisting videos:');
      videos.forEach(v => console.log(`- ${v.title} (${v._id})`));
      
      console.log('\nSkipping sample data creation.');
      return;
    }

    // Create performers
    console.log('\nCreating sample performers...');
    const createdPerformers = await Performer.insertMany(samplePerformers);
    console.log(`✅ Created ${createdPerformers.length} performers`);

    // Create videos with references to performers
    console.log('\nCreating sample videos...');
    const videosWithRefs = sampleVideos.map((video, index) => ({
      ...video,
      performer: createdPerformers[index]._id,
      uploader: adminUser._id
    }));

    const createdVideos = await Video.insertMany(videosWithRefs);
    console.log(`✅ Created ${createdVideos.length} videos`);

    console.log('\n✅ Sample data added successfully');

  } catch (error) {
    console.error('❌ Error adding sample data:', error);
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

// Run the function
addSampleData(); 