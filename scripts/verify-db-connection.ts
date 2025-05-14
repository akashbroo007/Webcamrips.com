// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import mongoose from 'mongoose';
import connectDB from '../lib/db';
import { getRegisteredModels } from '../lib/models';

async function verifyDBConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log(`Connection string: ${process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    
    // Try to connect to the database
    const db = await connectDB();
    
    if (!db) {
      console.error('Failed to connect to MongoDB - connection returned null');
      process.exit(1);
    }
    
    // Check connection state
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    console.log('Connection ready state meaning:');
    console.log('0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting');
    
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Successfully connected to MongoDB');
      
      // Print available models
      console.log('Registered Mongoose models:', getRegisteredModels());
      
      // List all collections
      try {
        if (mongoose.connection.db) {
          const collections = await mongoose.connection.db.listCollections().toArray();
          console.log('Available collections:');
          collections.forEach(collection => {
            console.log(`- ${collection.name}`);
          });
        } else {
          console.log('Database object not available');
        }
      } catch (error) {
        console.error('Error listing collections:', error);
      }
      
      // Test a query
      try {
        if (mongoose.models.User) {
          const userCount = await mongoose.models.User.countDocuments();
          console.log(`Total users in database: ${userCount}`);
        }
        
        if (mongoose.models.Video) {
          const videoCount = await mongoose.models.Video.countDocuments();
          console.log(`Total videos in database: ${videoCount}`);
        }
      } catch (error) {
        console.error('Error running test queries:', error);
      }
    } else {
      console.error('❌ Not connected to MongoDB properly');
      console.error('Connection state:', mongoose.connection.readyState);
    }
  } catch (error) {
    console.error('Error testing MongoDB connection:', error);
    process.exit(1);
  } finally {
    // Close the connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('Connection closed successfully');
    }
  }
}

// Run if executed directly
if (require.main === module) {
  verifyDBConnection()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Unhandled error during DB verification:', err);
      process.exit(1);
    });
}

export default verifyDBConnection; 