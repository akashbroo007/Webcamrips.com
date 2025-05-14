"use client"

import { FC, useState } from 'react';
import Link from 'next/link';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaTwitter } from 'react-icons/fa';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const SignupPage: FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear errors when field is edited
    if (name === 'password' || name === 'confirmPassword') {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { password: '', confirmPassword: '' };

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
      valid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Register the user through the API
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });
      
      const registerData = await registerResponse.json();
      
      if (!registerResponse.ok) {
        console.error('Registration failed:', registerData.error);
        alert(registerData.error || 'Failed to create account. Please try again.');
        setIsLoading(false);
        return;
      }
      
      console.log('Registration successful:', registerData);
      
      // After successful registration, sign in the user
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      
      if (result?.error) {
        console.error('Sign in error after registration:', result.error);
        alert('Account created, but failed to sign in. Please try logging in manually.');
        router.push('/login');
        return;
      }
      
      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      alert('An error occurred during registration. Please try again.');
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true);
    try {
      console.log(`Initiating ${provider} sign in...`);
      
      // Show a message to the user
      if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && provider === 'google') {
        alert('Google authentication is not configured yet. Please add your Google OAuth credentials to the .env.local file.');
        setIsLoading(false);
        return;
      }
      
      if (!process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID && provider === 'twitter') {
        alert('Twitter authentication is not configured yet. Please add your Twitter OAuth credentials to the .env.local file.');
        setIsLoading(false);
        return;
      }
      
      const result = await signIn(provider, { 
        callbackUrl: '/dashboard',
        redirect: true
      });
      
      console.log(`${provider} sign in result:`, result);
      
      // The page will be redirected automatically
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      alert(`Error signing in with ${provider}. Please try again.`);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="bg-dark min-h-screen py-12">
        <div className="container-custom max-w-md mx-auto">
          <div className="bg-secondary rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Create an Account</h1>
              <p className="text-gray-400">Join the WebcamRips community</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <FiUser />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="bg-gray-800 text-white block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Choose a username"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <FiMail />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-gray-800 text-white block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <FiLock />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`bg-gray-800 text-white block w-full pl-10 pr-10 py-3 border ${
                      errors.password ? 'border-red-500' : 'border-gray-700'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                    placeholder="Choose a strong password"
                    required
                  />
                  <div 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </div>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <FiLock />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`bg-gray-800 text-white block w-full pl-10 pr-10 py-3 border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-700'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                    placeholder="Confirm your password"
                    required
                  />
                  <div 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </div>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={formData.terms}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-700 rounded bg-gray-800"
                    required
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-400">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 uppercase font-semibold disabled:opacity-70"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Social Login */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-secondary text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors gap-2 disabled:opacity-70"
                >
                  <FcGoogle className="text-xl" />
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('twitter')}
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors gap-2 disabled:opacity-70"
                >
                  <FaTwitter className="text-xl text-[#1DA1F2]" />
                  <span>Twitter</span>
                </button>
              </div>
            </div>

            {/* Login Link */}
            <div className="mt-6 text-center text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SignupPage; 