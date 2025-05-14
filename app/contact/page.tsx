import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { FiMail, FiMessageSquare, FiUser, FiHelpCircle, FiShield, FiAlertTriangle, FiCreditCard } from 'react-icons/fi';

export const metadata = {
  title: 'Contact Us - WebcamRips',
  description: 'Get in touch with the WebcamRips team for support, feedback, or business inquiries',
};

const ContactPage = () => {
  return (
    <>
      <Header />
      <main className="bg-secondary min-h-screen py-10">
        <div className="container-custom max-w-5xl">
          <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
          <p className="text-gray-400 mb-10">
            We're here to help. Reach out to our team with any questions or concerns.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-dark rounded-lg p-6">
                <h2 className="text-xl font-bold mb-6">Send Us a Message</h2>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2" htmlFor="name">
                        Your Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <FiUser className="text-gray-500" />
                        </div>
                        <input 
                          type="text" 
                          id="name" 
                          placeholder="Enter your name" 
                          className="w-full bg-secondary rounded py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-400 text-sm mb-2" htmlFor="email">
                        Email Address *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <FiMail className="text-gray-500" />
                        </div>
                        <input 
                          type="email" 
                          id="email" 
                          placeholder="Enter your email" 
                          className="w-full bg-secondary rounded py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-2" htmlFor="subject">
                      Subject *
                    </label>
                    <select 
                      id="subject" 
                      className="w-full bg-secondary rounded py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Select a topic</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="content">Content Request</option>
                      <option value="dmca">DMCA Takedown</option>
                      <option value="business">Business Partnership</option>
                      <option value="billing">Billing Issue</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-2" htmlFor="message">
                      Message *
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <FiMessageSquare className="text-gray-500" />
                      </div>
                      <textarea 
                        id="message" 
                        placeholder="Enter your message" 
                        rows={6}
                        className="w-full bg-secondary rounded py-3 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        required
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="privacy" 
                      className="mr-2"
                      required
                    />
                    <label htmlFor="privacy" className="text-gray-400 text-sm">
                      I agree to the <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> and consent to processing my data
                    </label>
                  </div>
                  
                  <div>
                    <button 
                      type="submit"
                      className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full transition-colors font-medium"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
            
            {/* Contact Info */}
            <div>
              <div className="bg-dark rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-4">
                      <FiMail className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Email Us</h3>
                      <p className="text-gray-400">support@webcamrips.com</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-4">
                      <FiHelpCircle className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Support Hours</h3>
                      <p className="text-gray-400">24/7 Support Available</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-dark rounded-lg p-6">
                <h2 className="text-xl font-bold mb-6">Specialized Support</h2>
                
                <div className="space-y-4">
                  <a href="/dmca" className="flex items-center p-3 hover:bg-secondary rounded transition-colors">
                    <FiShield className="text-primary mr-3" />
                    <div>
                      <h3 className="font-medium">DMCA Requests</h3>
                      <p className="text-gray-400 text-sm">Content removal requests</p>
                    </div>
                  </a>
                  
                  <a href="/2257" className="flex items-center p-3 hover:bg-secondary rounded transition-colors">
                    <FiAlertTriangle className="text-primary mr-3" />
                    <div>
                      <h3 className="font-medium">2257 Compliance</h3>
                      <p className="text-gray-400 text-sm">Documentation requests</p>
                    </div>
                  </a>
                  
                  <a href="/billing" className="flex items-center p-3 hover:bg-secondary rounded transition-colors">
                    <FiCreditCard className="text-primary mr-3" />
                    <div>
                      <h3 className="font-medium">Billing Support</h3>
                      <p className="text-gray-400 text-sm">Subscription & payment issues</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            
            <div className="bg-dark rounded-lg p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-2">What is the typical response time?</h3>
                  <p className="text-gray-300">
                    We strive to respond to all inquiries within 24 hours. Premium members receive priority support with faster response times.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold mb-2">How do I report inappropriate content?</h3>
                  <p className="text-gray-300">
                    If you believe content violates our terms or contains illegal material, please use the "Report" button on the video page 
                    or contact us directly with the video ID and details about your concern.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold mb-2">Can I request specific content to be archived?</h3>
                  <p className="text-gray-300">
                    Yes! Premium members can submit requests for specific performers or shows to be archived. 
                    Use the "Content Request" subject in the contact form above.
                  </p>
                </div>
                
                <div className="text-center mt-8">
                  <a href="/faq" className="text-primary hover:underline font-medium">
                    View all frequently asked questions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ContactPage; 