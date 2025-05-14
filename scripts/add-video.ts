import axios from 'axios';

async function addVideo(gofilesUrl: string) {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/videos`, {
      id: `video_${Date.now()}`,
      title: 'Sonya Parker Stream Recording',
      description: 'Recorded stream from Stripchat',
      gofilesUrl,
      thumbnailUrl: '/thumbnails/placeholder.jpg'
    });

    console.log('Video added successfully:', response.data);
    console.log('Video ID:', response.data.id);
    console.log('View video at:', `${process.env.NEXT_PUBLIC_API_URL}/videos/${response.data.id}`);
  } catch (error) {
    console.error('Error adding video:', error);
  }
}

// Get the Gofiles URL from command line argument
const gofilesUrl = process.argv[2];
if (!gofilesUrl) {
  console.error('Please provide the Gofiles URL as a command line argument');
  process.exit(1);
}

addVideo(gofilesUrl); 