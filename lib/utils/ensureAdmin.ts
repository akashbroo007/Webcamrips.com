import connectDB from '../db';
import User from '../models/User';
import bcrypt from 'bcryptjs';

/**
 * Ensures that an admin user exists in the database
 * This is useful for initial setup or when we need to ensure 
 * there's always an admin account available
 */
export async function ensureAdminExists() {
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
  } catch (error) {
    console.error('Error ensuring admin exists:', error);
  }
}

/**
 * Seed the database with additional test users if needed
 */
export async function seedTestUsers(count = 5) {
  try {
    await connectDB();
    
    const existingCount = await User.countDocuments();
    
    // Only seed if we have fewer than 5 users (including admin)
    if (existingCount > 5) {
      return;
    }
    
    const testUsers = [];
    
    for (let i = 1; i <= count; i++) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(`User${i}123!`, salt);
      
      testUsers.push({
        username: `testuser${i}`,
        email: `testuser${i}@example.com`,
        password: hashedPassword,
        isAdmin: false,
        isPremium: i % 2 === 0 // Make every other user premium
      });
    }
    
    if (testUsers.length > 0) {
      await User.insertMany(testUsers);
      console.log(`${testUsers.length} test users created successfully!`);
    }
  } catch (error) {
    console.error('Error seeding test users:', error);
  }
} 