// This script will seed the database with initial data
// Run with: node scripts/seed.js

require('dotenv').config({ path: '.env.local' });
const { ensureAdminExists, seedTestUsers } = require('../lib/utils/ensureAdmin');
const connectDB = require('../lib/db').default;
const mongoose = require('mongoose');

async function seed() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Ensuring admin user exists...');
    await ensureAdminExists();
    
    console.log('Seeding test users...');
    await seedTestUsers(5);
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

// Run the seed function
seed(); 