import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import connectDB from '../lib/db';

// Function to import all models 
async function importAllModels() {
  console.log('Initializing models...');
  
  const modelsDir = path.join(process.cwd(), 'lib/models');
  
  try {
    // Check if the models directory exists
    if (!fs.existsSync(modelsDir)) {
      console.error('Models directory not found at:', modelsDir);
      return;
    }
    
    // Get all files in the models directory
    const modelFiles = fs.readdirSync(modelsDir)
      .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
      .filter(file => !file.startsWith('index'));
    
    console.log(`Found ${modelFiles.length} model files to import`);
    
    // Import each model file
    for (const file of modelFiles) {
      const filePath = path.join(modelsDir, file);
      console.log(`Importing model from: ${filePath}`);
      
      try {
        // Dynamic import for each model file
        await import(`../lib/models/${file.replace(/\.(ts|js)$/, '')}`);
        console.log(`Successfully imported model: ${file}`);
      } catch (error) {
        console.error(`Error importing model ${file}:`, error);
      }
    }
    
    // Print all registered models
    console.log('Registered Mongoose models:', Object.keys(mongoose.models));
  } catch (error) {
    console.error('Error importing models:', error);
  }
}

// Main function
async function main() {
  try {
    // Connect to database
    await connectDB();
    
    // Import all models
    await importAllModels();
    
    console.log('Models initialization completed');
  } catch (error) {
    console.error('Error initializing models:', error);
  } finally {
    // Disconnect from database
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  }
}

// Execute if this file is run directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Unhandled error during model initialization:', err);
      process.exit(1);
    });
}

export default importAllModels; 