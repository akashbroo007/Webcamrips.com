import { connectDB } from '../lib/utils/db';
import User from '../lib/models/User';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testAdminLogin() {
  try {
    // Connect to database
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB');

    // Check if the admin account exists
    const adminEmail = 'superadmin@webcamrips.com';
    const adminUser = await User.findOne({ email: adminEmail }).select('+password');

    if (!adminUser) {
      console.log('Admin user not found!');
      process.exit(1);
    }

    console.log('Admin user found:');
    console.log(`Username: ${adminUser.username}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Is Admin: ${adminUser.isAdmin}`);
    console.log(`Is Premium: ${adminUser.isPremium}`);

    // Test password
    const password = 'SecurePassword123!';
    const isPasswordValid = await adminUser.comparePassword(password);

    if (isPasswordValid) {
      console.log('\nPassword is valid! Login would succeed.');
    } else {
      console.log('\nPassword is invalid! Login would fail.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error testing admin login:', error);
    process.exit(1);
  }
}

// Run the test
testAdminLogin(); 