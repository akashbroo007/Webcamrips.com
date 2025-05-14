import React from 'react';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { BsTwitter } from 'react-icons/bs';

export default function LoginButtons() {
  return (
    <div className="flex flex-col gap-4 mt-6">
      <button
        onClick={() => signIn('google', { callbackUrl: '/' })}
        className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        <FcGoogle className="w-5 h-5" />
        Continue with Google
      </button>
      
      <button
        onClick={() => signIn('twitter', { callbackUrl: '/' })}
        className="flex items-center justify-center gap-2 px-4 py-2 text-white bg-[#1DA1F2] rounded-lg hover:bg-[#1a91da] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1DA1F2]"
      >
        <BsTwitter className="w-5 h-5" />
        Continue with Twitter
      </button>
    </div>
  );
} 