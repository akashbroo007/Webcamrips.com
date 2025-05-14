import path from 'path';
import fs from 'fs';
import { generateThumbnails, getVideoMetadata, ThumbnailOptions } from '../lib/utils/ffmpeg';
import { logger } from '../lib/utils/logger';
import appConfig from '../config/app';

// Test video paths
const TEST_VIDEOS_DIR = path.join(process.cwd(), 'recordings', 'test');
const TEST_VIDEO = path.join(TEST_VIDEOS_DIR, 'lofi-girl-2025-04-23T11-27-38.168Z.mp4');
const DIRECT_VIDEO = path.join(process.cwd(), 'recordings', 'direct', 'lofi-test-2025-04-23T11-34-44.212Z.mp4');

async function testThumbnailGeneration() {
  console.log('\n🧪 Testing thumbnail generation...');

  try {
    // Test single thumbnail generation
    const singleThumbnailOptions: ThumbnailOptions = {
      inputPath: TEST_VIDEO,
      timeOffset: '00:00:10',
      width: 320,
      count: 1
    };

    console.log('\n📸 Testing single thumbnail generation...');
    const singleThumbnail = await generateThumbnails(singleThumbnailOptions);
    console.log('✅ Single thumbnail generated:', singleThumbnail);

    // Test multiple thumbnails generation
    const multiThumbnailOptions: ThumbnailOptions = {
      inputPath: DIRECT_VIDEO,
      width: 640,
      count: 3
    };

    console.log('\n📸 Testing multiple thumbnails generation...');
    const multiThumbnails = await generateThumbnails(multiThumbnailOptions);
    console.log('✅ Multiple thumbnails generated:', multiThumbnails);

    // Test custom output path
    const customPathOptions: ThumbnailOptions = {
      inputPath: TEST_VIDEO,
      outputPath: path.join(appConfig.storage.thumbnailsDir, 'custom-thumb.jpg'),
      timeOffset: '00:00:15',
      width: 480,
      count: 1
    };

    console.log('\n📸 Testing custom output path...');
    const customPathThumbnail = await generateThumbnails(customPathOptions);
    console.log('✅ Custom path thumbnail generated:', customPathThumbnail);

  } catch (error) {
    console.error('❌ Thumbnail generation test failed:', error);
    throw error;
  }
}

async function testVideoMetadata() {
  console.log('\n🧪 Testing video metadata extraction...');

  try {
    // Test metadata extraction for test video
    console.log('\n📊 Testing metadata extraction for test video...');
    const testVideoMetadata = await getVideoMetadata(TEST_VIDEO);
    console.log('✅ Test video metadata:', testVideoMetadata);

    // Test metadata extraction for direct video
    console.log('\n📊 Testing metadata extraction for direct video...');
    const directVideoMetadata = await getVideoMetadata(DIRECT_VIDEO);
    console.log('✅ Direct video metadata:', directVideoMetadata);

    // Verify metadata fields
    const requiredFields = ['duration', 'width', 'height', 'codec', 'bitrate'] as const;
    type MetadataField = typeof requiredFields[number];
    
    for (const field of requiredFields) {
      if (testVideoMetadata[field as keyof typeof testVideoMetadata] === undefined) {
        console.warn(`⚠️ Missing ${field} in test video metadata`);
      }
      if (directVideoMetadata[field as keyof typeof directVideoMetadata] === undefined) {
        console.warn(`⚠️ Missing ${field} in direct video metadata`);
      }
    }

  } catch (error) {
    console.error('❌ Video metadata test failed:', error);
    throw error;
  }
}

async function testErrorHandling() {
  console.log('\n🧪 Testing error handling...');

  try {
    // Test with non-existent video
    const nonExistentVideo = path.join(TEST_VIDEOS_DIR, 'non-existent.mp4');
    
    console.log('\n⚠️ Testing thumbnail generation with non-existent video...');
    try {
      await generateThumbnails({ inputPath: nonExistentVideo });
      console.error('❌ Expected error for non-existent video, but got success');
    } catch (error) {
      console.log('✅ Correctly handled non-existent video error');
    }

    console.log('\n⚠️ Testing metadata extraction with non-existent video...');
    try {
      await getVideoMetadata(nonExistentVideo);
      console.error('❌ Expected error for non-existent video, but got success');
    } catch (error) {
      console.log('✅ Correctly handled non-existent video error');
    }

  } catch (error) {
    console.error('❌ Error handling test failed:', error);
    throw error;
  }
}

async function runTests() {
  console.log('🚀 Starting FFmpeg utils tests...');

  try {
    await testThumbnailGeneration();
    await testVideoMetadata();
    await testErrorHandling();
    console.log('\n✅ All FFmpeg utils tests completed successfully!');
  } catch (error) {
    console.error('\n❌ FFmpeg utils tests failed:', error);
    process.exit(1);
  }
}

runTests();