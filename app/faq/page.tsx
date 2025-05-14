import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { FiChevronDown, FiChevronUp, FiSearch } from 'react-icons/fi';

export const metadata = {
  title: 'FAQ - WebcamRips',
  description: 'Frequently asked questions about WebcamRips - find answers to common questions about our service',
};

// FAQ data organized by categories
const faqData = {
  general: [
    {
      question: "What is WebcamRips?",
      answer: "WebcamRips is a platform that archives high-quality webcam performances from various adult streaming sites. We preserve these performances and make them available for users to watch on-demand."
    },
    {
      question: "Is all content on WebcamRips legal?",
      answer: "Yes, all content on WebcamRips is legally obtained and complies with relevant laws and regulations, including age verification requirements and intellectual property rights. We take legal compliance very seriously."
    },
    {
      question: "How often is new content added?",
      answer: "New content is added daily. Our team monitors popular webcam platforms 24/7 to capture and archive the best performances as they happen."
    }
  ],
  account: [
    {
      question: "How do I create an account?",
      answer: "Click the 'Sign Up' button in the top-right corner of the site. You'll need to provide a valid email address and create a password. You must be at least 18 years old to create an account."
    },
    {
      question: "Is my payment information secure?",
      answer: "Absolutely. We use industry-standard encryption and secure payment processors. We never store your full credit card details on our servers."
    },
    {
      question: "How do I reset my password?",
      answer: "Click the 'Login' button, then select 'Forgot Password'. Enter the email address associated with your account, and we'll send you instructions to reset your password."
    },
    {
      question: "Can I change my username?",
      answer: "Yes, you can change your username in your account settings. However, this can only be done once every 30 days."
    }
  ],
  content: [
    {
      question: "How do you select which performances to archive?",
      answer: "Our content team monitors popular webcam platforms for high-quality performances, focusing on popularity, performer quality, and unique content. We also take requests from our premium members."
    },
    {
      question: "Can I request specific content to be archived?",
      answer: "Yes! Premium members can submit requests for specific performers or shows to be archived. While we can't guarantee all requests will be fulfilled, we prioritize user suggestions."
    },
    {
      question: "Why was a video removed?",
      answer: "Videos may be removed for various reasons, including DMCA takedown requests, performer opt-outs, or if the content is found to violate our terms of service or legal requirements."
    },
    {
      question: "How long are videos available on the platform?",
      answer: "Once archived, videos remain available indefinitely unless removed for legal reasons or at the request of the performer."
    }
  ],
  technical: [
    {
      question: "What video quality do you offer?",
      answer: "We strive to archive videos in the highest quality available from the source, typically 720p or 1080p. Premium members have access to the highest quality streams and downloads."
    },
    {
      question: "Can I download videos?",
      answer: "Premium members can download videos for personal offline viewing. Standard members can only stream content online."
    },
    {
      question: "Which devices can I use to watch content?",
      answer: "Our platform is compatible with all modern browsers on desktop, mobile, and tablet devices. We also offer adaptive streaming to ensure optimal playback based on your device and connection speed."
    },
    {
      question: "Why is a video buffering or playing slowly?",
      answer: "Video playback performance depends on your internet connection speed and device capabilities. We recommend a minimum connection speed of 5 Mbps for HD content. You can adjust video quality settings to improve playback on slower connections."
    }
  ],
  membership: [
    {
      question: "What are the benefits of a premium membership?",
      answer: "Premium members enjoy ad-free viewing, access to exclusive content, ability to download videos, higher video quality, content requests, priority support, and early access to new features."
    },
    {
      question: "How much does premium membership cost?",
      answer: "We offer several subscription tiers starting at $9.99 per month. You can view all pricing options on our Premium page. We also offer discounts for longer subscription commitments."
    },
    {
      question: "How do I cancel my premium membership?",
      answer: "You can cancel your premium membership at any time from your account settings. Your premium access will continue until the end of your current billing period."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 7-day refund policy for new premium subscriptions if you're unsatisfied with the service. Please contact our support team to request a refund within this period."
    }
  ],
  legal: [
    {
      question: "How do I submit a DMCA takedown request?",
      answer: "If you believe your copyrighted content has been uploaded without permission, please visit our DMCA page for instructions on submitting a proper takedown request."
    },
    {
      question: "How do you verify performer age and consent?",
      answer: "We only archive content from verified platforms that have their own strict age verification procedures. Additionally, we maintain records in compliance with 18 U.S.C. § 2257 requirements."
    },
    {
      question: "Can performers request content removal?",
      answer: "Yes, performers can request removal of their content at any time by submitting a verification request through our Content Removal page."
    }
  ]
};

const FAQPage = () => {
  return (
    <>
      <Header />
      <main className="bg-secondary min-h-screen py-10">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-400 mb-8">
            Find answers to the most common questions about WebcamRips.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-10">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search for answers..." 
                className="w-full bg-dark rounded-lg py-4 px-5 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                <FiSearch className="text-gray-500" size={20} />
              </div>
            </div>
          </div>
          
          {/* FAQ Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <button className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-full transition-colors">
              All
            </button>
            <button className="bg-dark hover:bg-gray-700 text-white px-5 py-2 rounded-full transition-colors">
              General
            </button>
            <button className="bg-dark hover:bg-gray-700 text-white px-5 py-2 rounded-full transition-colors">
              Account
            </button>
            <button className="bg-dark hover:bg-gray-700 text-white px-5 py-2 rounded-full transition-colors">
              Content
            </button>
            <button className="bg-dark hover:bg-gray-700 text-white px-5 py-2 rounded-full transition-colors">
              Technical
            </button>
            <button className="bg-dark hover:bg-gray-700 text-white px-5 py-2 rounded-full transition-colors">
              Membership
            </button>
            <button className="bg-dark hover:bg-gray-700 text-white px-5 py-2 rounded-full transition-colors">
              Legal
            </button>
          </div>
          
          {/* FAQ Sections */}
          {Object.entries(faqData).map(([category, questions]) => (
            <div key={category} className="mb-10">
              <h2 className="text-2xl font-bold mb-6 capitalize">{category} Questions</h2>
              
              <div className="space-y-4">
                {questions.map((faq, index) => (
                  <div key={index} className="bg-dark rounded-lg overflow-hidden">
                    <button className="w-full text-left p-5 flex justify-between items-center hover:bg-gray-800 transition-colors">
                      <h3 className="font-bold text-lg">{faq.question}</h3>
                      <FiChevronDown className="text-primary" size={20} />
                    </button>
                    <div className="p-5 pt-0 border-t border-gray-800">
                      <p className="text-gray-300">{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Still Have Questions */}
          <div className="bg-gradient-to-r from-dark to-primary rounded-lg p-8 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-gray-200 mb-6">
              Can't find the answer you're looking for? Please contact our friendly support team.
            </p>
            <Link href="/contact" className="inline-block bg-white text-primary font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default FAQPage; 