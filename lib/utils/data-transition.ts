import { isInMockMode } from '../db';
import { adminUser, getMockUserByEmail, getMockUserById, getMockUsers } from '../mock/users';
import User from '../models/User';

/**
 * Helper function to gracefully transition between mock data and real database
 * for user-related operations
 */

/**
 * Get a user by email with graceful fallback
 */
export async function getUserByEmail(email: string) {
  try {
    // First try to get from real database
    if (!isInMockMode()) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        return user;
      }
    }
    
    // Fallback to mock data if in mock mode or no real user found
    return getMockUserByEmail(email);
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    // Fallback to mock data on error
    return getMockUserByEmail(email);
  }
}

/**
 * Get a user by ID with graceful fallback
 */
export async function getUserById(id: string) {
  try {
    // First try to get from real database
    if (!isInMockMode()) {
      const user = await User.findById(id);
      if (user) {
        return user;
      }
    }
    
    // Fallback to mock data if in mock mode or no real user found
    return getMockUserById(id);
  } catch (error) {
    console.error('Error in getUserById:', error);
    // Fallback to mock data on error
    return getMockUserById(id);
  }
}

/**
 * Get all users with graceful fallback
 */
export async function getAllUsers(limit = 50) {
  try {
    // First try to get from real database
    if (!isInMockMode()) {
      const users = await User.find({})
        .sort({ createdAt: -1 })
        .limit(limit);
      
      if (users && users.length > 0) {
        return users;
      }
    }
    
    // Fallback to mock data if in mock mode or no real users found
    return getMockUsers();
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    // Fallback to mock data on error
    return getMockUsers();
  }
}

/**
 * Create initial admin user if it doesn't exist
 */
export async function createInitialAdminUser() {
  try {
    if (isInMockMode()) {
      console.log('In mock mode, skipping admin user creation');
      return null;
    }
    
    // Check if admin user exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return existingAdmin;
    }
    
    // Create admin user based on mock admin
    const newAdminUser = new User({
      username: adminUser.username,
      email: adminUser.email,
      isAdmin: true,
      isPremium: true,
      password: 'admin123', // This should be changed immediately
      passwordChangeRequired: true
    });
    
    await newAdminUser.save();
    console.log('Created initial admin user');
    return newAdminUser;
  } catch (error) {
    console.error('Error creating initial admin user:', error);
    return null;
  }
} 