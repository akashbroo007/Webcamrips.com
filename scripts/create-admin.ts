// Script to create an admin user

import { connectDB } from '../lib/utils/db';
import User from '../lib/models/User';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Create admin user
async function createAdmin() {
  try {
    // Connect to database
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB');

    // Default admin credentials
    const adminUsername = process.argv[2] || 'admin';
    const adminEmail = process.argv[3] || 'admin@example.com';
    const adminPassword = process.argv[4] || 'Admin123!';

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      $or: [
        { email: adminEmail.toLowerCase() },
        { username: adminUsername }
      ]
    });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      username: adminUsername,
      email: adminEmail.toLowerCase(),
      password: adminPassword, // Will be hashed by the pre-save hook
      isAdmin: true,
      isPremium: true,
    });

    // Save admin user to database
    await adminUser.save();

    console.log('Admin user created successfully!');
    console.log(`Username: ${adminUsername}`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('\nYou can now log in with these credentials.');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

// Run the function
createAdmin(); 