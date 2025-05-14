'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaTwitter } from 'react-icons/fa';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Check for error parameter in URL
  useEffect(() => {
    const errorParam = searchParams?.get('error');
    if (errorParam) {
      switch (errorParam) {
        case 'CredentialsSignin':
          setError('Invalid email or password. Please try again.');
          break;
        case 'session_error':
          setError('Your session has expired. Please log in again.');
          
          // Clear browser cookies and local storage to help with session issues
          try {
            // Clear localStorage
            localStorage.clear();
            // Clear sessionStorage
            sessionStorage.clear();
          } catch (e) {
            console.error('Error clearing storage:', e);
          }
          break;
        case 'session_size':
          setError('We encountered an issue with your session. This has been fixed - please log in again.');
          break;
        default:
          setError('An error occurred during login. Please try again.');
          break;
      }
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Normalize email (convert to lowercase)
      const normalizedEmail = formData.email.trim().toLowerCase();
      
      console.log('Attempting login with:', normalizedEmail);
      
      const result = await signIn('credentials', {
        redirect: false,
        email: normalizedEmail,
        password: formData.password,
      });

      if (result?.error) {
        console.log('Login error:', result.error);
        setError(result.error);
      } else if (result?.ok) {
        console.log('Login successful, redirecting...');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: string) => {
    setIsLoading(true);
    signIn(provider, { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <h1 className="font-bold">
            <span className="text-white text-4xl">Webcam</span>
            <span className="text-red-500 text-4xl">Rips</span>
          </h1>
          <p className="text-gray-400 mt-2">Sign in to your account</p>
        </div>
        
        {/* Card Container */}
        <div className="bg-gray-800 backdrop-blur-lg bg-opacity-50 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
          {/* Form Section */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-800 text-red-200 rounded-md flex items-start">
                <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <FiMail />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="bg-gray-700/50 text-white block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    autoComplete="email"
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:text-primary-light transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <FiLock />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="bg-gray-700/50 text-white block w-full pl-10 pr-10 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    autoComplete="current-password"
                  />
                  <div 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 flex justify-center items-center bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-medium rounded-lg shadow-lg hover:shadow-red-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : 'Sign In'}
              </button>
            </form>
            
            {/* Social Login Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
                </div>
              </div>
              
              {/* Social Login Buttons */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-600 rounded-lg shadow-sm bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium transition-colors duration-200"
                >
                  <FcGoogle className="text-xl mr-2" />
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('twitter')}
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-600 rounded-lg shadow-sm bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium transition-colors duration-200"
                >
                  <FaTwitter className="text-xl mr-2 text-[#1DA1F2]" />
                  <span>Twitter</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-8 py-6 bg-gray-700/30 border-t border-gray-700 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link href="/register" className="text-red-400 hover:text-red-300 font-medium transition-colors">
                Sign up
              </Link>
            </p>
            {error && (
              <p className="text-gray-400 text-sm mt-2">
                Having trouble logging in?{' '}
                <Link href="/session-recovery.html" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Try our session recovery tool
                </Link>
              </p>
            )}
          </div>
        </div>
        
        {/* Copyright Text */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} WebcamRips. All rights reserved.
        </div>
      </div>
    </div>
  );
} 