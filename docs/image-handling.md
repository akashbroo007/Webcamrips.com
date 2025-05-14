# Image Handling in the Application

This document explains how to handle images in the application, including fallback mechanisms for missing images and best practices.

## Available Solutions

The application provides multiple ways to handle images and their fallbacks:

### 1. FallbackImage Component (Recommended)

The `FallbackImage` component is a wrapper around Next.js's Image component that automatically handles image loading errors.

```tsx
import FallbackImage from '@/app/components/FallbackImage';

// Basic usage
<FallbackImage 
  src="/path/to/image.jpg" 
  alt="Description" 
  width={200} 
  height={200} 
/>

// With type specified for appropriate fallback
<FallbackImage 
  src={user.avatarUrl} 
  alt={`${user.name}'s avatar`} 
  width={64} 
  height={64}
  type="avatar"
  className="rounded-full"
/>

// For video thumbnails
<FallbackImage 
  src={video.thumbnailUrl} 
  alt={video.title} 
  width={320} 
  height={180}
  type="thumbnail"
  className="rounded-md"
/>
```

### 2. Client-Side Error Handling

For regular `<img>` tags, the application includes a global error handler in `public/images/fix-image-paths.js` that automatically replaces broken images with appropriate fallbacks:

```jsx
// This is handled automatically, but you can also add it manually:
<img 
  src={imageUrl} 
  alt="Description" 
  onError={(e) => {
    e.target.src = '/images/default-avatar.svg';
  }} 
/>
```

### 3. API Fallback (For Edge Cases)

The application includes a placeholder API endpoint at `/api/placeholder/[image]` that serves appropriate fallback images.

## Available Fallback Images

The following fallback images are available:

- `/images/default-avatar.svg` - For user avatars and profile pictures
- `/images/default-thumbnail.svg` - For video thumbnails and media previews
- `/images/placeholder.svg` - Generic placeholder for other types of images

## Best Practices

1. **Use the FallbackImage component** when possible for consistent error handling.
2. **Choose the appropriate fallback type** for different image use cases.
3. **Include meaningful alt text** for accessibility.
4. **Specify width and height** to prevent layout shifts.
5. **Use the `priority` prop** for above-the-fold images that are critical to the initial page load.

## Troubleshooting

If images are not displaying correctly:

1. Check that the image path is correct
2. Verify the image exists in the expected location
3. Ensure proper permissions on the images
4. Use the browser developer tools to check for network errors
5. Consider using the `className="avatar"` or `className="thumbnail"` classes to help the fallback system identify the appropriate replacement

## Adding New Default Images

To add new default images, place them in the `/public/images/` directory and update the `FallbackImage` component if needed. 