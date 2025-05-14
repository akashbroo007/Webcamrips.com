// This script helps diagnose MongoDB connection issues
// by checking your public IP and testing if it can connect

require('dotenv').config({ path: '.env.local' });
const axios = require('axios');
const mongoose = require('mongoose');

async function checkIPAndConnection() {
  try {
    console.log('MongoDB Connection Diagnostics Tool');
    console.log('----------------------------------');
    
    // Step 1: Get current public IP address
    console.log('Step 1: Checking your current public IP address...');
    const ipResponse = await axios.get('https://api.ipify.org?format=json');
    const publicIP = ipResponse.data.ip;
    console.log(`Your public IP address is: ${publicIP}`);
    console.log('Make sure this IP is whitelisted in MongoDB Atlas Network Access settings.');
    console.log('');
    
    // Step 2: Parse and display connection string (hiding password)
    console.log('Step 2: Checking connection string format...');
    const connectionString = process.env.MONGODB_URI;
    if (!connectionString) {
      console.error('Error: MONGODB_URI environment variable is not defined');
      return;
    }
    
    // Extract and display parts of the connection string (without password)
    const sanitizedConnectionString = connectionString.replace(
      /(mongodb(\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/,
      '$1*****$4'
    );
    console.log(`Connection string: ${sanitizedConnectionString}`);
    console.log('');
    
    // Step 3: Test connection
    console.log('Step 3: Testing MongoDB connection...');
    
    const connectionOptions = {
      serverSelectionTimeoutMS: 15000, // 15 seconds
      connectTimeoutMS: 15000,
      socketTimeoutMS: 30000,
      tls: true,
      tlsInsecure: false
    };
    
    try {
      console.log('Attempting to connect to MongoDB...');
      await mongoose.connect(connectionString, connectionOptions);
      
      console.log('✓ Successfully connected to MongoDB!');
      console.log(`MongoDB server version: ${mongoose.version}`);
      
      // Test basic operations
      console.log('Testing database operations...');
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`Found ${collections.length} collections:`);
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
      
      await mongoose.disconnect();
      console.log('Connection closed successfully');
      
    } catch (error) {
      console.error('✗ Connection failed with error:');
      console.error(`Error type: ${error.name}`);
      console.error(`Error message: ${error.message}`);
      
      if (error.name === 'MongoServerSelectionError') {
        console.error('\nPossible causes:');
        console.error('1. Your IP address is not whitelisted in MongoDB Atlas');
        console.error(`   Current IP: ${publicIP}`);
        console.error('2. MongoDB credentials are incorrect');
        console.error('3. Network connectivity issues');
        console.error('4. TLS/SSL version incompatibility');
        
        console.log('\nRecommended actions:');
        console.log('1. Go to MongoDB Atlas > Network Access and add your current IP');
        console.log('2. Check your username and password in .env.local');
        console.log('3. Make sure your network allows outbound connections to MongoDB');
        console.log('4. Try updating the TLS settings in your connection string');
      }
    }
    
  } catch (error) {
    console.error('Error running diagnostics:', error);
  }
}

// Run the diagnostics
checkIPAndConnection(); 