// Load environment variables
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in your environment variables');
  process.exit(1);
}

// Connection options with improved settings for reliability
const options = {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 15000,
  heartbeatFrequencyMS: 10000,
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 60000,
  retryWrites: true,
  retryReads: true,
};

console.log('Attempting to connect to MongoDB...');
console.log(`URI: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`); // Hide credentials when logging

mongoose.connect(MONGODB_URI, options)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB');
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    
    // List all collections
    return mongoose.connection.db.listCollections().toArray();
  })
  .then((collections) => {
    console.log('Available collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Close the connection
    return mongoose.connection.close();
  })
  .then(() => {
    console.log('Connection closed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    
    if (err.name === 'MongooseServerSelectionError') {
      console.error('\nPossible causes:');
      console.error('1. Your IP address is not whitelisted in MongoDB Atlas');
      console.error('2. Your MongoDB credentials are incorrect');
      console.error('3. Network connectivity issues\n');
      
      console.log('Solutions:');
      console.log('1. Visit https://cloud.mongodb.com/v2 and add your current IP to the IP Access List');
      console.log('2. Check your MongoDB username and password in .env.local');
      console.log('3. Ensure your network allows outbound connections to MongoDB (port 27017)\n');
    }
    
    process.exit(1);
  }); 