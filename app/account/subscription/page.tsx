'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiCreditCard, FiCheck, FiAlertCircle, FiRefreshCw, FiDownload } from 'react-icons/fi';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

const plans: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Premium Monthly',
    price: 9.99,
    interval: 'month',
    features: [
      'Unlimited access to all content',
      'HD video quality',
      'Download videos',
      'Ad-free experience',
      'Cancel anytime'
    ]
  },
  {
    id: 'yearly',
    name: 'Premium Yearly',
    price: 99.99,
    interval: 'year',
    features: [
      'Unlimited access to all content',
      'HD video quality',
      'Download videos',
      'Ad-free experience',
      'Save 16% annually',
      'Cancel anytime'
    ]
  }
];

interface SubscriptionData {
  id?: string;
  status?: 'active' | 'canceled' | 'past_due' | 'inactive';
  plan?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

// Extend the session type to include custom properties
interface CustomUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isAdmin?: boolean;
  isPremium?: boolean;
}

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  // Type assertion to safely access custom properties
  const user = session?.user as CustomUser | undefined;
  const isPremium = user?.isPremium || false;

  useEffect(() => {
    const fetchSubscription = async () => {
      if (isPremium) {
        try {
          const response = await fetch('/api/user/subscription', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setSubscription(data);
          } else {
            console.error('Failed to fetch subscription data');
          }
        } catch (error) {
          console.error('Error fetching subscription data:', error);
        }
      } else {
        // Mock subscription data for development
        setSubscription({
          status: 'inactive'
        });
      }
      setLoading(false);
    };

    fetchSubscription();
  }, [isPremium]);

  const handleUpgrade = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    // In a real implementation, redirect to checkout page with plan ID
    toast.success(`Redirecting to checkout for ${plan.name}`);
  };

  const handleCancelSubscription = async () => {
    try {
      // This would be a real API call in production
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Subscription has been canceled');
      setSubscription(prev => ({ 
        ...prev, 
        status: 'canceled',
        cancelAtPeriodEnd: true
      }));
      setCancelModalOpen(false);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  if (loading) {
    return (
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto my-12"></div>
    );
  }

  return (
    <>
      <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center">
            <FiCreditCard className="mr-2 text-primary" />
            Your Subscription
          </h3>
        </div>
        <div className="p-6">
          {isPremium ? (
            <>
              <div className="mb-6 bg-gray-800 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <span className="bg-green-800 text-green-200 px-3 py-1 rounded-full text-sm mr-3">
                    {subscription?.status === 'canceled' ? 'Ending Soon' : 'Active'}
                  </span>
                  <h4 className="text-xl font-semibold">Premium Subscription</h4>
                </div>
                
                <div className="space-y-2 text-gray-300">
                  {subscription?.cancelAtPeriodEnd ? (
                    <p className="flex items-center text-amber-400">
                      <FiAlertCircle className="mr-2" />
                      Your subscription will end on {new Date(subscription?.currentPeriodEnd || Date.now()).toLocaleDateString()}
                    </p>
                  ) : (
                    <p className="flex items-center">
                      <FiRefreshCw className="mr-2" />
                      Next billing date: {new Date(subscription?.currentPeriodEnd || Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                  )}
                  
                  <p className="flex items-center">
                    <FiCreditCard className="mr-2" />
                    Current plan: {subscription?.plan || 'Premium Monthly'}
                  </p>
                </div>
                
                <div className="mt-6 space-x-3">
                  {!subscription?.cancelAtPeriodEnd && (
                    <button 
                      onClick={() => setCancelModalOpen(true)}
                      className="bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                    >
                      Cancel Subscription
                    </button>
                  )}
                  
                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md">
                    View Billing History
                  </button>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-lg font-medium mb-4">Premium Benefits</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <FiCheck className="text-green-500 mt-1 mr-2" />
                    <span>Unlimited access to all premium content</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="text-green-500 mt-1 mr-2" />
                    <span>HD video quality on all videos</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="text-green-500 mt-1 mr-2" />
                    <span>Download videos for offline viewing</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="text-green-500 mt-1 mr-2" />
                    <span>Ad-free browsing experience</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="text-green-500 mt-1 mr-2" />
                    <span>Priority customer support</span>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm mr-3">
                    Free Account
                  </span>
                  <h4 className="text-xl font-semibold">Upgrade to Premium</h4>
                </div>
                
                <p className="text-gray-400 mb-6">
                  Upgrade to Premium for unlimited access to all videos and features.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {plans.map((plan) => (
                  <div key={plan.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-primary transition-all">
                    <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
                    <div className="text-3xl font-bold text-primary mb-2">
                      ${plan.price}
                      <span className="text-sm text-gray-400 font-normal">/{plan.interval}</span>
                    </div>
                    
                    <ul className="mt-4 mb-6 space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <FiCheck className="text-green-500 mt-1 mr-2" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button 
                      onClick={() => handleUpgrade(plan)}
                      className="w-full btn-primary"
                    >
                      Choose Plan
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-gray-800 rounded-lg text-gray-300 text-sm">
                <p className="flex items-center">
                  <FiAlertCircle className="mr-2 text-primary" />
                  All subscriptions automatically renew until canceled.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Cancel Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Cancel Subscription</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to cancel your premium subscription? You'll continue to have access until the end of your current billing period.
            </p>
            <div className="flex space-x-3 justify-end">
              <button 
                onClick={() => setCancelModalOpen(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                Keep Subscription
              </button>
              <button 
                onClick={handleCancelSubscription}
                className="bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 