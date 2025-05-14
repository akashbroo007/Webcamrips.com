import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AuthProvider from '@/components/providers/AuthProvider';
import AgeVerificationProvider from '@/components/AgeVerificationProvider';
import ConnectionStatus from '@/app/components/ConnectionStatus';
import SessionErrorHandler from '@/app/components/SessionErrorHandler';
import { Toaster } from 'react-hot-toast';
import InitializeAdmin from '@/components/providers/InitializeAdmin';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WebcamRips - Webcam Archive Videos',
  description: 'The home to the world\'s best webcam archive videos platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="/images/fix-image-paths.js" defer></script>
        <script src="/coi-serviceworker.min.js"></script>
        <meta httpEquiv="Content-Security-Policy" content="style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <AgeVerificationProvider>
            <InitializeAdmin />
            <SessionErrorHandler />
            <div className="min-h-screen bg-secondary text-white">
              {children}
              <ConnectionStatus />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#333',
                    color: '#fff',
                  },
                  success: {
                    style: {
                      background: '#0a5e2c',
                    },
                  },
                  error: {
                    style: {
                      background: '#a72424',
                    },
                  },
                }}
              />
            </div>
          </AgeVerificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
} 