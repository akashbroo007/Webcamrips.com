"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown, Check } from "lucide-react";

export default function SubscriptionPage() {
  const router = useRouter();
  
  const features = {
    basic: [
      'Standard video quality',
      'Basic video uploads',
      'Community access',
      'Basic support'
    ],
    premium: [
      'High definition quality',
      'Unlimited video uploads',
      'Priority support',
      'Early access to new features',
      'Advanced video management'
    ]
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-4xl rounded-lg bg-white p-8 shadow-md">
        <div className="flex flex-col items-center mb-8">
          <Crown className="h-16 w-16 text-yellow-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Premium Content</h1>
          <p className="mt-2 text-center text-gray-600 max-w-xl">
            The page you tried to access requires a premium subscription. Upgrade today to unlock all premium features and content.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border rounded-lg p-6 bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">Free</h2>
            <p className="text-gray-500 mb-4">Your current plan</p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Basic access to streams</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Limited recordings</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Standard definition</span>
              </li>
            </ul>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/")}
            >
              Continue with Free
            </Button>
          </div>
          
          <div className="border rounded-lg p-6 bg-blue-50 border-blue-200 relative">
            <div className="absolute -top-3 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Recommended
            </div>
            <h2 className="text-xl font-semibold mb-4">Premium</h2>
            <p className="text-gray-500 mb-4">Unlock all features</p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Full access to all streams</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Unlimited recordings</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>High definition quality</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Priority support</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Early access to new features</span>
              </li>
            </ul>
            <Button className="w-full">
              Upgrade Now
            </Button>
          </div>
        </div>
        
        <div className="flex justify-center mt-4">
          <Button 
            onClick={() => router.back()}
            variant="ghost"
            className="flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
} 