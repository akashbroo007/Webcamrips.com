import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { FiUsers, FiVideo, FiShield, FiGlobe } from 'react-icons/fi';

export const metadata = {
  title: 'About Us - WebcamRips',
  description: 'Learn more about WebcamRips, the premier webcam archive platform',
};

const AboutPage = () => {
  return (
    <>
      <Header />
      <main className="bg-secondary min-h-screen py-10">
        <div className="container-custom">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">About WebcamRips</h1>
            <p className="text-gray-400 max-w-3xl mx-auto">
              The premier platform for archiving and enjoying the best webcam performances from around the world.
            </p>
          </div>
          
          {/* Mission Section */}
          <div className="mb-16">
            <div className="bg-gradient-to-r from-dark to-primary bg-opacity-30 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-300 mb-6">
                WebcamRips was founded with a clear mission: to create the most comprehensive archive of webcam performances, 
                preserving the art and entertainment of live webcam shows for posterity while providing a safe, 
                legal platform for both performers and viewers.
              </p>
              <p className="text-gray-300">
                We believe in the value of preserving these performances, many of which would otherwise be lost 
                after their initial broadcast. Our dedicated team works tirelessly to ensure that the best content 
                is archived, properly categorized, and made available to our community.
              </p>
            </div>
          </div>
          
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <div className="bg-dark rounded-lg p-6 text-center">
              <FiVideo className="text-primary text-4xl mx-auto mb-4" />
              <div className="text-3xl font-bold mb-2">125K+</div>
              <div className="text-gray-400">Videos Archived</div>
            </div>
            <div className="bg-dark rounded-lg p-6 text-center">
              <FiUsers className="text-primary text-4xl mx-auto mb-4" />
              <div className="text-3xl font-bold mb-2">5K+</div>
              <div className="text-gray-400">Models Featured</div>
            </div>
            <div className="bg-dark rounded-lg p-6 text-center">
              <FiGlobe className="text-primary text-4xl mx-auto mb-4" />
              <div className="text-3xl font-bold mb-2">2.5M+</div>
              <div className="text-gray-400">Monthly Visitors</div>
            </div>
            <div className="bg-dark rounded-lg p-6 text-center">
              <FiShield className="text-primary text-4xl mx-auto mb-4" />
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-gray-400">Legal Compliance</div>
            </div>
          </div>
          
          {/* Story Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Our Story</h2>
            <div className="bg-dark rounded-lg p-8">
              <p className="text-gray-300 mb-4">
                WebcamRips began in 2019 when a group of tech enthusiasts noticed that many amazing webcam performances 
                were disappearing forever once the live streams ended. What started as a small project to archive 
                personal favorite performances quickly grew into something much bigger.
              </p>
              <p className="text-gray-300 mb-4">
                As our collection grew, so did our audience. We realized there was significant demand for a platform 
                that treated webcam performances as an art form worthy of preservation. We evolved from a simple archive 
                into a comprehensive platform with advanced search capabilities, categorization, and community features.
              </p>
              <p className="text-gray-300">
                Today, WebcamRips stands as the industry leader in webcam archiving, working directly with performers and 
                platforms to ensure ethical content acquisition while providing viewers with the highest quality experience 
                possible.
              </p>
            </div>
          </div>
          
          {/* Values Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-dark rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3 text-primary">Ethical Content</h3>
                <p className="text-gray-300">
                  We operate with the highest ethical standards, ensuring all content is legally obtained with appropriate 
                  rights and permissions. We maintain strict age verification and only feature adult performers.
                </p>
              </div>
              <div className="bg-dark rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3 text-primary">Quality First</h3>
                <p className="text-gray-300">
                  We're committed to providing the highest quality viewing experience, from video resolution to 
                  site performance. Our advanced encoding ensures optimal playback on any device.
                </p>
              </div>
              <div className="bg-dark rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3 text-primary">Performer Support</h3>
                <p className="text-gray-300">
                  We believe in supporting the performers who create the content our users enjoy. We offer revenue 
                  sharing programs and promotional opportunities for performers featured on our platform.
                </p>
              </div>
            </div>
          </div>
          
          {/* Team Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Our Team</h2>
            <div className="bg-dark rounded-lg p-8">
              <p className="text-gray-300 mb-6">
                Behind WebcamRips is a dedicated team of developers, content curators, and industry professionals 
                with a passion for webcam culture and digital preservation. Our diverse team brings together expertise 
                in video technology, content management, and user experience design.
              </p>
              <div className="flex justify-center">
                <Link href="/contact" className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full transition-colors font-medium">
                  Contact Our Team
                </Link>
              </div>
            </div>
          </div>
          
          {/* FAQ Preview */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="bg-dark rounded-lg p-8">
              <div className="space-y-6 mb-6">
                <div>
                  <h3 className="text-lg font-bold mb-2">Is all content on WebcamRips legal?</h3>
                  <p className="text-gray-300">
                    Yes, all content on WebcamRips is legally obtained and complies with relevant laws and regulations, 
                    including age verification requirements and intellectual property rights.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">How do you select which performances to archive?</h3>
                  <p className="text-gray-300">
                    Our content team monitors popular webcam platforms for high-quality performances, focusing on 
                    popularity, performer quality, and unique content. We also take requests from our community.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Can I request specific content to be archived?</h3>
                  <p className="text-gray-300">
                    Yes! Premium members can submit requests for specific performers or shows to be archived. 
                    While we can't guarantee all requests will be fulfilled, we prioritize user suggestions.
                  </p>
                </div>
              </div>
              <div className="flex justify-center">
                <Link href="/faq" className="text-primary hover:underline font-medium">
                  View all FAQs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AboutPage; 