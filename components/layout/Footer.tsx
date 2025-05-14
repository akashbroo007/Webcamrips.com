"use client"

import { FC } from 'react';
import Link from 'next/link';
import { FiGithub, FiTwitter, FiInstagram, FiYoutube, FiMail } from 'react-icons/fi';

const Footer: FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark pt-12 pb-6">
      <div className="container-custom">
        {/* Footer Top */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Column 1 - About */}
          <div>
            <h3 className="text-xl font-bold mb-4">WebcamRips</h3>
            <p className="text-gray-400 mb-4">
              The home to the world's best webcam archive videos platform. Millions of archived videos of cam models around the world.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FiInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FiYoutube size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FiGithub size={20} />
              </a>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/videos" className="text-gray-400 hover:text-primary transition-colors">
                  Videos
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-400 hover:text-primary transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/models" className="text-gray-400 hover:text-primary transition-colors">
                  Models
                </Link>
              </li>
              <li>
                <Link href="/channels" className="text-gray-400 hover:text-primary transition-colors">
                  Channels
                </Link>
              </li>
              <li>
                <Link href="/watchlater" className="text-gray-400 hover:text-primary transition-colors">
                  Watch Later
                </Link>
              </li>
              <li>
                <Link href="/history" className="text-gray-400 hover:text-primary transition-colors">
                  History
                </Link>
              </li>
              <li>
                <Link href="/upload" className="text-gray-400 hover:text-primary transition-colors">
                  Upload
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Information</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/premium" className="text-gray-400 hover:text-primary transition-colors">
                  Premium
                </Link>
              </li>
              <li>
                <Link href="/dmca" className="text-gray-400 hover:text-primary transition-colors">
                  DMCA
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Legal */}
          <div>
            <h3 className="text-xl font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-400 hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/2257" className="text-gray-400 hover:text-primary transition-colors">
                  2257 Compliance
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-400 hover:text-primary transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-6"></div>

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {currentYear} WebcamRips. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <Link href="/terms" className="text-gray-500 hover:text-gray-300 text-sm">
              Terms
            </Link>
            <Link href="/privacy" className="text-gray-500 hover:text-gray-300 text-sm">
              Privacy
            </Link>
            <Link href="/cookies" className="text-gray-500 hover:text-gray-300 text-sm">
              Cookies
            </Link>
            <Link href="/contact" className="text-gray-500 hover:text-gray-300 text-sm">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 