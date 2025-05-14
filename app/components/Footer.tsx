'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">WebcamRips</h3>
            <p className="text-gray-400">
              The best place to find and share webcam recordings.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/videos" className="text-gray-400 hover:text-white">
                  Videos
                </Link>
              </li>
              <li>
                <Link href="/performers" className="text-gray-400 hover:text-white">
                  Performers
                </Link>
              </li>
              <li>
                <Link href="/upload" className="text-gray-400 hover:text-white">
                  Upload
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/2257" className="text-gray-400 hover:text-white">
                  2257 Statement
                </Link>
              </li>
              <li>
                <Link href="/dmca" className="text-gray-400 hover:text-white">
                  DMCA
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-400 hover:text-white">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/report" className="text-gray-400 hover:text-white">
                  Report Content
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} WebcamRips. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 