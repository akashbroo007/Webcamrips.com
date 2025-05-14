# WebcamRips Recording Pipeline Testing Guide

This guide explains how to thoroughly test the real-time stream recording pipeline of the WebcamRips platform. The recording pipeline consists of several components that work together to detect streams, record them, process the recordings, and make them available in the application.

## 🧪 Pipeline Components

The recording pipeline consists of the following components:

1. **Stream Detection**: Uses Puppeteer to detect when performers are streaming
2. **Stream Recording**: Uses yt-dlp (or streamlink as fallback) to record live streams
3. **Post-Processing**: Uses FFmpeg to generate thumbnails and extract metadata
4. **Database Entry Creation**: Creates Video entries with metadata in MongoDB
5. **Frontend Display**: Shows the recorded videos in the user interface

## 🚀 Quick Start

The fastest way to test the entire pipeline is using our automated test script:

```powershell
# On Windows
.\scripts\test-pipeline.ps1

# On Linux/Mac
# Coming soon - use individual test scripts for now
```

This script will guide you through testing each component of the pipeline with interactive prompts.

## 📋 Prerequisites

Before testing, ensure you have the following installed:

1. **FFmpeg**: Required for video processing and thumbnail generation
    - Windows: `choco install ffmpeg` (with Chocolatey)
    - Mac: `brew install ffmpeg` (with Homebrew)
    - Linux: `apt install ffmpeg` (Debian/Ubuntu)

2. **yt-dlp**: Required for stream recording
    - Install with pip: `pip install yt-dlp`
    - Or download from [GitHub](https://github.com/yt-dlp/yt-dlp/releases)

3. **MongoDB**: Required for database tests
    - Local installation or cloud instance
    - Connection string configured in `.env.local`

4. **Node.js & npm**: Required to run the TypeScript scripts
    - Version 16+ recommended

## 🧰 Testing Tools

We've created several scripts to help test different aspects of the pipeline:

### 1. Dependency Setup Script

```
.\scripts\setup-dependencies.ps1
```

This script checks if all required dependencies are installed and properly configured. It will:
- Verify FFmpeg and yt-dlp are in PATH
- Check MongoDB connection configuration
- Create necessary directories for recordings and thumbnails

### 2. Quick Test Script

```
npx ts-node scripts\quick-test.ts
```

This script performs a quick test of the core recording functionality:
- Records 10 seconds from a public stream
- Generates a thumbnail
- Extracts video metadata
- Doesn't require MongoDB

### 3. Full Pipeline Test Script

```
npx ts-node scripts\test-full-pipeline.ts
```

This script tests the entire pipeline from stream detection to frontend display:
- Tests all pipeline components
- Creates test entries in the database
- Provides a detailed log of the process
- Requires MongoDB connection

## 🔍 Testing Each Component Individually

### 1. Stream Detection Testing

To specifically test stream detection:

1. Use the `checkPerformerStatus` method to test detection for a specific performer:

```typescript
// Example: Manual test in Node REPL
const streamDetector = require('./lib/services/streamDetector').default;
const performer = { name: 'TestPerformer', platforms: [{ platform: 'Chaturbate', channelId: 'channel_name' }] };
streamDetector.checkPerformerStatus(performer).then(console.log);
```

2. Check DOM selectors in `config/platforms.ts` to ensure they match the current site layout
3. Verify Puppeteer is able to access the target sites (check network/firewall settings)

### 2. Stream Recording Testing

To test just the recording functionality:

1. Use the `scripts/test-recorder.ts` script to record a specific URL
2. Verify recordings are saved to the correct location with the expected naming convention
3. Check that recordings stop properly when duration is reached or on manual termination

```
npx ts-node scripts\test-recorder.ts
```

### 3. Post-Processing Testing

To test thumbnail generation and metadata extraction:

1. Use FFmpeg utility functions directly on an existing video file:

```typescript
// Example: Manual test in Node REPL
const { generateThumbnails, getVideoMetadata } = require('./lib/utils/ffmpeg');
generateThumbnails({ inputPath: 'path/to/video.mp4', count: 1 }).then(console.log);
getVideoMetadata('path/to/video.mp4').then(console.log);
```

2. Verify thumbnails are created at the expected times in the video
3. Check that metadata is correctly extracted (duration, resolution, codec, etc.)

### 4. Database Integration Testing

To test database integration:

1. Ensure MongoDB is running and properly configured
2. Create test entries and check they appear in the database
3. Verify relationships between Recording and Video models

```typescript
// Example manual test
const Recording = require('./lib/models/Recording').default;
const Video = require('./lib/models/Video').default;
const mongoose = require('mongoose');

// Connect to DB, create entries, check references work, etc.
```

## 🐞 Troubleshooting Common Issues

### Stream Detection Issues

- **Problem**: Unable to detect streams that are actually live
  - **Solution**: Check DOM selectors in `config/platforms.ts`, they may be outdated
  - **Solution**: Ensure Puppeteer has proper user agent configured

- **Problem**: False positives (detecting offline streams as online)
  - **Solution**: Add more negative selectors in platform configuration

### Recording Issues

- **Problem**: yt-dlp not working or crashing
  - **Solution**: Update to the latest version: `pip install -U yt-dlp`
  - **Solution**: Check if the site requires authentication (cookies)

- **Problem**: Recordings stop unexpectedly
  - **Solution**: Look for network interruptions or site restrictions
  - **Solution**: Check disk space available for recordings

### Processing Issues

- **Problem**: FFmpeg cannot generate thumbnails
  - **Solution**: Verify FFmpeg is installed correctly and in PATH
  - **Solution**: Check the video file is valid and not corrupted

- **Problem**: Metadata extraction fails
  - **Solution**: Check FFmpeg version compatibility
  - **Solution**: Verify the video has proper streams (video/audio)

### Database Issues

- **Problem**: Cannot connect to MongoDB
  - **Solution**: Check connection string in `.env.local`
  - **Solution**: Verify network connectivity to MongoDB server

- **Problem**: Duplicate key errors
  - **Solution**: Check for unique constraints in models
  - **Solution**: Use proper error handling in creation methods

## 📊 Log Analysis

The test scripts generate detailed logs in the `logs/` directory. Here's how to interpret them:

- `recorder-test.log`: Contains the output from the full pipeline test
- Look for lines starting with `❌` to identify failures
- Check timestamps to understand the flow and timing of each step
- Summary section at the end shows the overall test results

## 🎯 Expected Results

A successful test should show the following results:

1. Stream detection correctly identifies online status
2. Recording completes and saves a valid video file
3. Thumbnails are generated from the video
4. Metadata is extracted from the video
5. Database entries are created for the recording and video
6. Output log shows all steps completed without errors

Example success log pattern:
```
✅ Dependencies available
✅ Stream detection success
✅ Recording completed successfully
✅ Thumbnail generated
✅ Video metadata extracted
✅ Database entries created
```

## 🎮 Starting the Production Recorder

Once testing is complete, you can start the production recorder:

```
npx ts-node scripts\start-recorder.ts
```

This will start the scheduler service that regularly checks for active streams and records them according to your configuration.

## 👩‍💻 Contributing New Tests

When adding new features to the recording pipeline, please also add/update tests:

1. Add edge case tests for your new functionality
2. Update documentation to reflect new test procedures
3. Log issues encountered during testing in the issue tracker

---

For any questions or issues with the testing process, please refer to the main documentation or contact the development team. 