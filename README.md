# WebcamRips

WebcamRips is a comprehensive platform for managing and streaming webcam content from various platforms. This application is built with modern technologies including Next.js, React, MongoDB, and Express.js.

## Features

- **Video Management:** Upload, organize, and manage video content
- **User Management:** User authentication, profiles, and permissions
- **Content Discovery:** Search and browse videos by category, performer, or platform
- **Responsive Design:** Mobile-friendly interface with modern UI/UX

## Tech Stack

- **Frontend:** Next.js, React, TypeScript
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **Video Processing:** FFmpeg
- **Cron Jobs:** Scheduled tasks for content management

## Core Services

- **VideoService:** Manages video uploads and processing
- **UserService:** Handles user authentication and profiles
- **PerformerService:** Manages performer information and content
- **SchedulerService:** Handles scheduled tasks and content updates

## Models

- **User:** User accounts and profiles
- **Video:** Video content and metadata
- **Performer:** Performer information and content
- **Category:** Content categorization

## Environment Variables

Required environment variables:

```env
MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## Project Structure

```
webcamrips/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # React components
│   └── pages/            # Page components
├── lib/                   # Core functionality
│   ├── models/           # Database models
│   ├── services/         # Business logic
│   └── utils/            # Utility functions
├── public/               # Static assets
└── scripts/              # Utility scripts
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start the development server: `npm run dev`

## License

This project is licensed under the MIT License.

## Disclaimer

This application is for educational purposes only. The developers of this application do not endorse or encourage the uploading of copyrighted material without proper authorization. 