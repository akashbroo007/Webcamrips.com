#!/usr/bin/env node

// Import required modules
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Get MongoDB URI from environment
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: No MONGODB_URI environment variable found!');
  console.error('Please check your .env.local file');
  process.exit(1);
}

// Parse the MongoDB URI to extract host
let host;
try {
  const url = new URL(MONGODB_URI);
  host = url.hostname;
  console.log(`MongoDB Host: ${host}`);
} catch (err) {
  console.error('Error parsing MongoDB URI:', err.message);
  process.exit(1);
}

// Check DNS resolution
console.log(`\nTesting DNS resolution for ${host}...`);
dns.resolve(host, (err, addresses) => {
  if (err) {
    console.error(`DNS resolution failed: ${err.message}`);
    console.error('This suggests a network connectivity or DNS issue.');
    console.log('Please check your internet connection and DNS settings.');
  } else {
    console.log(`DNS resolved successfully to: ${addresses.join(', ')}`);
  }
});

// Connection options with high timeouts for testing
const connectionOptions = {
  serverSelectionTimeoutMS: 60000,
  socketTimeoutMS: 90000,
  connectTimeoutMS: 60000,
  maxPoolSize: 10,
  minPoolSize: 5
};

console.log('\nAttempting to connect to MongoDB...');
console.log(`Connection string: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
console.log('Connection options:', JSON.stringify(connectionOptions, null, 2));

// Attempt connection
mongoose.connect(MONGODB_URI, connectionOptions)
  .then(() => {
    console.log('\n✅ Successfully connected to MongoDB!');
    
    // Get connection status
    const { readyState } = mongoose.connection;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
      4: 'invalid',
    };
    
    console.log(`Connection state: ${states[readyState]} (${readyState})`);
    
    // Test a simple query to verify full connection capability
    console.log('\nTesting database query capability...');
    return mongoose.connection.db.admin().listDatabases();
  })
  .then((dbs) => {
    console.log('Databases available:');
    dbs.databases.forEach((db) => {
      console.log(`- ${db.name}`);
    });
    
    console.log('\n✅ Database query successful!');
    console.log('\nConnection test PASSED. Your MongoDB connection is working correctly.');
    
    // Close the connection
    return mongoose.disconnect();
  })
  .then(() => {
    console.log('Connection closed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ MongoDB connection failed!');
    console.error('Error details:', error);
    
    // Provide helpful troubleshooting tips
    console.log('\nTroubleshooting tips:');
    console.log('1. Check your MongoDB Atlas network access settings');
    console.log('2. Verify your username and password');
    console.log('3. Ensure your IP address is whitelisted in MongoDB Atlas');
    console.log('4. Try setting MOCK_MODE=true in .env.local for development');
    console.log('5. Check for network/firewall restrictions');
    
    process.exit(1);
  }); 