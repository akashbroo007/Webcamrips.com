# WebcamRips - Project Context

## Overview

WebcamRips is a comprehensive webcam content management and streaming platform built with modern web technologies. The application allows users to upload, organize, and stream webcam content from various platforms, with advanced features for content recording, file hosting, and user management.

## Tech Stack

### Frontend
- **Next.js 14.1.0** - React framework with App Router
- **React 18.2.0** - UI library
- **TypeScript 5.3.3** - Type-safe JavaScript
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Framer Motion 11.0.3** - Animation library
- **React Hook Form 7.56.1** - Form handling
- **React Hot Toast 2.5.2** - Toast notifications
- **Lucide React 0.503.0** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js 4.18.2** - Web framework
- **MongoDB 6.3.0** - NoSQL database
- **Mongoose 8.1.1** - MongoDB ODM
- **NextAuth.js 4.24.5** - Authentication
- **bcryptjs 2.4.3** - Password hashing
- **jsonwebtoken 9.0.2** - JWT handling

### Video Processing & Recording
- **FFmpeg (fluent-ffmpeg 2.1.3)** - Video processing
- **yt-dlp-exec 1.0.2** - Video downloading
- **Streamlink 1.0.4** - Stream processing
- **Puppeteer 24.7.2** - Web automation
- **Playwright 1.52.0** - Browser automation

### File Hosting & Storage
- **AWS S3 SDK 3.800.0** - Amazon S3 storage
- **Google Cloud Storage 7.16.0** - GCS storage
- **Azure Storage Blob 12.27.0** - Azure storage
- **File hosting services** - Mixdrop, Gofiles integration

### Utilities & Monitoring
- **Winston 3.17.0** - Logging
- **Cron 4.3.0** - Scheduled tasks
- **Node-cron 3.0.3** - Cron job scheduling
- **UUID 11.1.0** - Unique identifiers
- **Nodemailer 6.10.1** - Email functionality

## Project Architecture

### Directory Structure

```
webcamrips/
├── app/                          # Next.js App Router
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── videos/              # Video management
│   │   ├── upload/              # File upload handling
│   │   ├── admin/               # Admin functionality
│   │   ├── user/                # User management
│   │   ├── external/            # External video sources
│   │   ├── recording-configs/   # Recording configuration
│   │   ├── history/             # User history
│   │   └── watchlater/          # Watch later functionality
│   ├── components/              # React components
│   │   ├── layout/              # Layout components
│   │   ├── admin/               # Admin components
│   │   └── providers/           # Context providers
│   ├── videos/                  # Video listing pages
│   ├── video/                   # Individual video pages
│   ├── dashboard/               # User dashboard
│   ├── admin/                   # Admin panel
│   ├── upload/                  # Upload interface
│   ├── auth/                    # Authentication pages
│   └── static/                  # Static pages (about, contact, etc.)
├── lib/                         # Core functionality
│   ├── models/                  # Database models
│   ├── services/                # Business logic services
│   ├── utils/                   # Utility functions
│   ├── auth/                    # Authentication logic
│   └── mock/                    # Mock data
├── components/                  # Shared components
├── scripts/                     # Utility scripts
├── public/                      # Static assets
├── temp/                        # Temporary files
├── recordings/                  # Recording storage
├── config/                      # Configuration files
└── docs/                        # Documentation
```

## Core Models

### User Model (`lib/models/User.ts`)
- **Fields**: username, email, password, avatar, bio, isAdmin, isPremium
- **Features**: Password hashing, OAuth provider integration, password reset
- **Indexes**: providers.providerId, resetPasswordToken

### Video Model (`lib/models/Video.ts`)
- **Fields**: title, description, gofilesUrl, mixdropUrl, thumbnail, duration, views, performer, tags, platform
- **Features**: Virtual fields for formatted duration and file URLs, view counting
- **Indexes**: Text search on title/description, createdAt, views, performer, platform

### Performer Model (`lib/models/Performer.ts`)
- **Fields**: name, platform, bio, avatar, socialLinks
- **Features**: Platform-specific performer information

### Recording Model (`lib/models/Recording.ts`)
- **Fields**: modelName, platform, streamUrl, status, duration, filePath, fileSize
- **Features**: Recording session management, upload status tracking

### Additional Models
- **RecordingConfig**: Recording configuration settings
- **RecentlyViewed**: User viewing history
- **WatchLater**: User watch later list
- **ExternalVideo**: External video source management

## Core Services

### RecordingService (`lib/services/RecordingService.ts`)
- **Stream Detection**: Uses StreamDetectorService to detect live streams
- **Video Recording**: Records streams using yt-dlp with configurable quality
- **File Upload**: Uploads to multiple hosting services (Mixdrop, Gofiles)
- **Database Integration**: Creates Video and Performer entries automatically
- **Error Handling**: Comprehensive error handling and status tracking

### FileHostService (`lib/services/FileHostService.ts`)
- **Multi-Host Upload**: Uploads to Mixdrop and Gofiles simultaneously
- **Fallback Strategy**: Ensures content availability across multiple hosts
- **API Integration**: Handles various file hosting service APIs

### StreamDetectorService (`lib/services/StreamDetectorService.ts`)
- **Stream Detection**: Detects live streams from various platforms
- **URL Processing**: Handles different stream URL formats
- **Platform Support**: Supports multiple webcam platforms

### SchedulerService (`lib/services/schedulerService.ts`)
- **Automated Recording**: Scheduled recording of live streams
- **Content Management**: Automated content processing and upload
- **Cron Jobs**: Scheduled tasks for content updates

## Authentication & Authorization

### NextAuth.js Integration
- **Providers**: Credentials, OAuth providers
- **Session Management**: JWT-based sessions
- **Role-based Access**: Admin, Premium, and regular user roles

### Middleware (`middleware.ts`)
- **Route Protection**: Protects authenticated routes
- **Role Verification**: Ensures proper access levels
- **Cookie Management**: Handles large cookies to prevent HTTP 431 errors
- **Database Health Checks**: Monitors database connectivity

## API Architecture

### RESTful Endpoints
- **GET /api/videos**: Video listing with pagination, filtering, and sorting
- **POST /api/videos**: Video creation
- **GET /api/videos/[id]**: Individual video details
- **GET /api/videos/related**: Related videos
- **POST /api/upload**: File upload handling
- **GET /api/auth/**: Authentication endpoints
- **GET /api/admin/**: Admin functionality
- **GET /api/user/**: User management

### Response Patterns
- **Pagination**: Standardized pagination with page, limit, total, pages
- **Error Handling**: Consistent error response format
- **Caching**: Appropriate cache headers for different content types
- **Data Projection**: Optimized queries with field selection

## Frontend Components

### Layout Components
- **Header**: Navigation, search, user menu
- **Footer**: Links, social media, legal information
- **AccountSidebar**: User account navigation
- **ConnectionStatus**: Real-time connection monitoring

### Video Components
- **VideoGrid**: Responsive video grid layout
- **VideoCard**: Individual video display card
- **VideoPlayer**: Video playback component
- **AddExternalVideoForm**: External video addition form

### Admin Components
- **Admin-specific components** for content management
- **Dashboard components** for analytics and monitoring

## Database Design

### MongoDB Collections
- **users**: User accounts and profiles
- **videos**: Video content and metadata
- **performers**: Performer information
- **recordings**: Recording sessions
- **recordingconfigs**: Recording configuration
- **recentlyviewed**: User viewing history
- **watchlater**: Watch later lists
- **externalvideos**: External video sources

### Indexing Strategy
- **Text Search**: Full-text search on video titles and descriptions
- **Performance**: Indexes on frequently queried fields
- **Compound Indexes**: Multi-field indexes for complex queries

## Security Features

### Authentication Security
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure session management
- **OAuth Integration**: Social login support
- **Password Reset**: Secure token-based reset

### Application Security
- **Input Validation**: Comprehensive input sanitization
- **CORS Configuration**: Configurable cross-origin settings
- **Rate Limiting**: API rate limiting (implied)
- **Content Security Policy**: CSP headers for XSS protection

## Performance Optimizations

### Frontend
- **Next.js Optimization**: Built-in performance features
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic code splitting
- **Caching**: Strategic caching strategies

### Backend
- **Database Optimization**: Lean queries, field projection
- **Connection Pooling**: MongoDB connection management
- **Caching Headers**: Appropriate cache control
- **Response Optimization**: Minimized response payloads

## Development & Deployment

### Development Scripts
- **npm run dev**: Development server with IP configuration
- **npm run build**: Production build
- **npm run start**: Production server
- **npm run test**: Various testing scripts
- **npm run recorder**: Recording service startup

### Environment Configuration
- **MongoDB URI**: Database connection
- **NextAuth Configuration**: Authentication settings
- **File Hosting APIs**: External service credentials
- **Cloud Storage**: AWS, GCS, Azure configuration

### Server Configuration (`server.js`)
- **Custom Server**: Express.js with Next.js integration
- **Header Management**: Large header handling
- **CORS Support**: Configurable CORS settings
- **Error Handling**: Comprehensive error management

## Content Management

### Video Processing Pipeline
1. **Stream Detection**: Detect live streams from platforms
2. **Recording**: Record streams using yt-dlp
3. **Processing**: Video processing with FFmpeg
4. **Upload**: Multi-host upload to file hosting services
5. **Database Entry**: Create video and performer records
6. **Cleanup**: Remove temporary files

### File Hosting Strategy
- **Primary Hosts**: Mixdrop and Gofiles
- **Fallback System**: Multiple hosts for redundancy
- **Direct URLs**: Optimized video delivery
- **Content ID Tracking**: Track content across platforms

## Monitoring & Logging

### Logging System
- **Winston Logger**: Structured logging
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Request/response logging
- **Recording Logs**: Detailed recording session logs

### Health Checks
- **Database Connectivity**: Regular database health checks
- **API Endpoints**: Health check endpoints
- **Connection Status**: Real-time connection monitoring

## Legal & Compliance

### Content Management
- **DMCA Compliance**: DMCA takedown procedures
- **Content Moderation**: Content filtering capabilities
- **User Terms**: Terms of service enforcement
- **Privacy Policy**: User privacy protection

### Educational Purpose Disclaimer
- **Clear Disclaimers**: Educational use only
- **Copyright Notice**: Respect for intellectual property
- **User Guidelines**: Content upload guidelines

## Future Considerations

### Scalability
- **Microservices**: Potential service decomposition
- **CDN Integration**: Content delivery network
- **Load Balancing**: Horizontal scaling support
- **Database Sharding**: MongoDB sharding for large datasets

### Feature Enhancements
- **Real-time Features**: WebSocket integration
- **Advanced Search**: Elasticsearch integration
- **Analytics**: User behavior analytics
- **Mobile App**: React Native mobile application

This context provides a comprehensive overview of the WebcamRips platform architecture, helping developers understand the codebase structure, key components, and system interactions. 