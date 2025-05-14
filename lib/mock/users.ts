// Mock admin user for authentication fallback when database connection is unavailable
export const adminUser = {
  _id: 'admin-user-id-123',
  id: 'admin-user-id-123',
  username: 'admin',
  name: 'admin',
  email: 'admin@example.com',
  isAdmin: true,
  isPremium: true,
  avatar: null,
  bio: '',
  createdAt: new Date('2023-01-01').toISOString()
};

// Export a function to get mock users - only admin user for fallback
export const getMockUsers = () => {
  return [adminUser];
};

// Function to get a mock user by email - only admin user for fallback
export const getMockUserByEmail = (email: string) => {
  if (email === adminUser.email) {
    return adminUser;
  }
  return null;
};

// Function to get a mock user by ID - only admin user for fallback
export const getMockUserById = (id: string) => {
  if (id === adminUser._id || id === adminUser.id) {
    return adminUser;
  }
  return null;
};

// Function to update a mock user
export const updateMockUser = (email: string, updateData: Partial<typeof adminUser>) => {
  // Currently only supports updating the admin user
  if (email === adminUser.email) {
    // Update the mock admin user object
    if (updateData.username) {
      adminUser.username = updateData.username;
      adminUser.name = updateData.username; // Keep name and username in sync
    }
    
    if (updateData.bio !== undefined) {
      adminUser.bio = updateData.bio;
    }
    
    if (updateData.avatar) {
      adminUser.avatar = updateData.avatar;
    }
    
    return { ...adminUser };
  }
  
  return null;
}; 