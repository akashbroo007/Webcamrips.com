import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

// This endpoint initializes the admin user if needed
export async function POST() {
  try {
    await connectDB();

    // Check if admin@example.com exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });

    if (!existingAdmin) {
      console.log('Creating default admin user...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin123!', salt);
      
      // Create admin user
      const adminUser = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        isAdmin: true,
        isPremium: true
      });
      
      await adminUser.save();
      console.log('Admin user created successfully!');
    } else {
      // Ensure existing user has admin privileges
      if (!existingAdmin.isAdmin) {
        existingAdmin.isAdmin = true;
        existingAdmin.isPremium = true;
        await existingAdmin.save();
        console.log('Existing user updated with admin privileges');
      }
    }

    return NextResponse.json({ success: true, message: 'Admin user initialization completed successfully' });
  } catch (error) {
    console.error('Error during initialization:', error);
    return NextResponse.json({ success: false, error: 'Initialization failed' }, { status: 500 });
  }
} 