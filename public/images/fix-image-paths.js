// This is a client-side script to replace missing image paths with placeholder URLs
// Add this to your layout.tsx or _app.tsx

document.addEventListener('DOMContentLoaded', () => {
  // Replace broken image sources with placeholder images
  document.querySelectorAll('img').forEach(img => {
    img.onerror = function() {
      // Don't process images that are already placeholders
      if (this.src.includes('/api/placeholder/') || this.dataset.fallbackApplied === 'true') {
        return;
      }
      
      // Mark this image as having a fallback applied
      this.dataset.fallbackApplied = 'true';
      
      // Extract the image name and path
      const imgSrc = this.src;
      const imgPath = imgSrc.split('/').pop();
      
      // Determine the appropriate placeholder based on image attributes and classes
      let placeholderPath = '/images/default-avatar.svg';
      
      // Check for thumbnails or video-related images
      if (
        imgSrc.includes('thumbnail') || 
        imgSrc.includes('video') || 
        this.classList.contains('thumbnail') || 
        this.classList.contains('video-thumbnail') ||
        (imgPath && (imgPath.includes('thumb') || imgPath.endsWith('.jpg') || imgPath.endsWith('.jpeg')))
      ) {
        placeholderPath = '/images/default-thumbnail.svg';
      } 
      // Check for avatars or profile pictures
      else if (
        imgSrc.includes('avatar') || 
        imgSrc.includes('profile') || 
        imgSrc.includes('user') ||
        this.classList.contains('avatar') || 
        this.classList.contains('profile-image') ||
        this.classList.contains('user-image')
      ) {
        placeholderPath = '/images/default-avatar.svg';
      }
      
      // Set the placeholder
      this.src = placeholderPath;
    };
  });
  
  console.log('Image path fixer loaded');
});

/*
 * To use this script, add the following to your layout.tsx:
 *
 * <script src="/images/fix-image-paths.js" defer></script>
 */ 