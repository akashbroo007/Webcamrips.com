/**
 * Development utilities for managing Next.js and MongoDB
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.local' });

// Set options
const options = {
  clearCache: process.argv.includes('--clear-cache'),
  checkMongo: process.argv.includes('--check-mongo'),
  help: process.argv.includes('--help') || process.argv.includes('-h'),
  fixImages: process.argv.includes('--fix-images'),
};

// Display help
if (options.help) {
  console.log('Development Utilities');
  console.log('====================');
  console.log('');
  console.log('Usage: node scripts/dev-utils.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --clear-cache     Clear Next.js cache');
  console.log('  --check-mongo     Check MongoDB connection');
  console.log('  --fix-images      Create missing placeholder images');
  console.log('  --help, -h        Show this help');
  process.exit(0);
}

// Function to clear Next.js cache
function clearNextCache() {
  console.log('Clearing Next.js cache...');
  
  const cachePath = path.join(process.cwd(), '.next', 'cache');
  
  if (fs.existsSync(cachePath)) {
    try {
      fs.rmSync(cachePath, { recursive: true, force: true });
      console.log('✅ Next.js cache cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing Next.js cache:', error);
    }
  } else {
    console.log('ℹ️ No Next.js cache to clear');
  }
}

// Function to check MongoDB connection
function checkMongoConnection() {
  console.log('Checking MongoDB connection...');
  
  try {
    execSync('node scripts/check-ip-access.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Error checking MongoDB connection:', error);
  }
}

// Function to create missing placeholder images
function fixPlaceholderImages() {
  console.log('Creating placeholder images...');
  
  const thumbnailsDir = path.join(process.cwd(), 'public', 'images', 'thumbnails');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir, { recursive: true });
    console.log('Created thumbnails directory');
  }
  
  // List of placeholder images to create
  const placeholders = [
    { name: 'glamour.jpg', title: 'Glamour' },
    { name: 'fitness.jpg', title: 'Fitness' },
    { name: 'lifestyle.jpg', title: 'Lifestyle' },
    { name: 'fashion.jpg', title: 'Fashion' },
    { name: 'travel.jpg', title: 'Travel' },
  ];
  
  // Create each placeholder
  placeholders.forEach(placeholder => {
    const filePath = path.join(thumbnailsDir, placeholder.name);
    
    // Only create if it doesn't exist
    if (!fs.existsSync(filePath)) {
      const svgContent = `<svg width="320" height="180" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#333"/>
  <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#fff" text-anchor="middle" dominant-baseline="middle">${placeholder.title}</text>
</svg>`;
      
      fs.writeFileSync(filePath, svgContent);
      console.log(`Created placeholder: ${placeholder.name}`);
    } else {
      console.log(`Placeholder already exists: ${placeholder.name}`);
    }
  });
  
  console.log('✅ Placeholder images check completed');
}

// Run the requested operations
if (options.clearCache) {
  clearNextCache();
}

if (options.checkMongo) {
  checkMongoConnection();
}

if (options.fixImages) {
  fixPlaceholderImages();
}

// If no options provided, show help
if (!options.clearCache && !options.checkMongo && !options.fixImages && !options.help) {
  console.log('No options specified. Use --help to see available options.');
} 