import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function InstructionsPage() {
  return (
    <>
      <Header />
      <main className="container-custom py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Adding External Videos</h1>
          
          <div className="bg-secondary rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">How to Add Videos from Archivebate</h2>
            <p className="mb-4">
              Follow these steps to add videos from Archivebate to your WebcamRips application:
            </p>
            
            <ol className="list-decimal pl-5 space-y-4 mb-6">
              <li>
                <strong>Find a video on Archivebate</strong>
                <p className="text-gray-400 mt-1">
                  Visit <a href="https://archivebate.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Archivebate.com</a> and find a video you want to add.
                </p>
              </li>
              
              <li>
                <strong>Copy the video URL</strong>
                <p className="text-gray-400 mt-1">
                  Copy the video URL from your browser's address bar. Example: https://archivebate.com/watch/15769759
                </p>
              </li>
              
              <li>
                <strong>Log in as an admin</strong>
                <p className="text-gray-400 mt-1">
                  Make sure you're logged in to WebcamRips with an admin account.
                </p>
              </li>
              
              <li>
                <strong>Go to Add Video page</strong>
                <p className="text-gray-400 mt-1">
                  Click on the "+" button in the top navigation or go directly to <Link href="/add-video" className="text-primary hover:underline">/add-video</Link>.
                </p>
              </li>
              
              <li>
                <strong>Fill in the video details</strong>
                <p className="text-gray-400 mt-1">
                  Fill in the form with the following information:
                </p>
                <ul className="list-disc pl-5 mt-2 text-gray-400">
                  <li><strong>Title:</strong> Use the model name and platform (e.g., "TattooGirlAlia - Stripchat")</li>
                  <li><strong>Performer Name:</strong> The name of the performer (e.g., "TattooGirlAlia")</li>
                  <li><strong>Description:</strong> Add details about the video content</li>
                  <li><strong>Source URL:</strong> The original Archivebate URL</li>
                  <li><strong>Embed URL:</strong> The URL for embedding the video (if available) or use an iframe embed code</li>
                  <li><strong>Thumbnail URL:</strong> URL to a thumbnail image for the video</li>
                  <li><strong>Duration:</strong> Video duration in seconds (if known)</li>
                  <li><strong>Source Type:</strong> Select "iframe" for embedding</li>
                  <li><strong>Platform:</strong> Select the platform the video was recorded from (e.g., "Stripchat")</li>
                </ul>
              </li>
              
              <li>
                <strong>Submit the form</strong>
                <p className="text-gray-400 mt-1">
                  Click the "Add Video" button to submit the form and add the video to your database.
                </p>
              </li>
            </ol>
            
            <div className="bg-blue-900 bg-opacity-50 p-4 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Important Notes</h3>
              <ul className="list-disc pl-5 text-gray-400">
                <li>For embedding videos, you may need to inspect the video page source to find the correct embed URL.</li>
                <li>Make sure you have the necessary rights to display the content.</li>
                <li>Some platforms may block iframe embedding. In such cases, you may need to host the video yourself.</li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Link href="/add-video" className="btn-primary">
              Go to Add Video Form
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 