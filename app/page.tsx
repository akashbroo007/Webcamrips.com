import { Metadata } from 'next';
import Link from 'next/link';
import { FiPlay } from 'react-icons/fi';
import VideoGrid from '@/components/video/VideoGrid';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'WebcamRips - The Home of Premium Webcam Archives',
  description: 'Archive of premium webcam videos from top models around the world',
};

// Demo section for testing
const demoVideo = {
  title: "TattooGirlAlia - Stripchat",
  description: "Recorded webcam video from Stripchat platform",
  sourceUrl: "https://archivebate.com/watch/15769759",
  embedUrl: "https://www.example.com/embed/placeholder", // Replace with actual embed URL
  thumbnailUrl: "https://via.placeholder.com/640x360", // Replace with actual thumbnail
  duration: 0,
  sourceType: "iframe",
  platform: "Stripchat",
  performerName: "TattooGirlAlia"
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="container-custom py-10">
        <section className="mb-12">
          <h1 className="text-3xl font-bold mb-6">Popular Videos</h1>
          <VideoGrid />
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Performers</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* Featured performers would go here */}
          </div>
        </section>
        
        <section className="bg-dark rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Discover Premium Content</h2>
          <p className="text-gray-400 mb-6">
            Get unlimited access to our entire library of premium webcam content
          </p>
          <Link
            href="/premium"
            className="bg-primary hover:bg-primary-dark text-white font-semibold rounded-full px-8 py-3 inline-flex items-center transition-colors"
          >
            <span>Explore Premium</span> <FiPlay className="ml-2" />
          </Link>
        </section>

        <section className="py-12 bg-gray-900">
          <div className="container-custom">
            <h2 className="text-2xl font-bold mb-6 text-center">Featured Video</h2>
            <div className="max-w-4xl mx-auto">
              <div className="bg-secondary rounded-lg overflow-hidden shadow-lg">
                <div className="aspect-w-16 aspect-h-9 bg-black">
                  {/* Placeholder for video - in production this would be an iframe */}
                  <div className="flex items-center justify-center">
                    <div className="text-center p-8">
                      <h3 className="text-xl font-bold mb-2">{demoVideo.title}</h3>
                      <p className="text-gray-400 mb-4">{demoVideo.description}</p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/add-video" className="btn-primary">
                          Add This Video
                        </Link>
                        <Link href="/instructions" className="btn-secondary">
                          View Instructions
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-gray-400">{demoVideo.platform}</span>
                      {demoVideo.performerName && (
                        <span className="text-sm text-gray-400 ml-2">
                          • {demoVideo.performerName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-400">0 views</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
} 