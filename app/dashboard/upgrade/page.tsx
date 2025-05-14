"use client"

import { FC, useState } from 'react';
import Link from 'next/link';
import { 
  FiChevronLeft, 
  FiHardDrive, 
  FiCheckCircle, 
  FiArrowRight, 
  FiCreditCard,
  FiLock,
  FiCheck
} from 'react-icons/fi';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Mock storage plans
const storagePlans = [
  {
    id: 'basic',
    name: 'Basic',
    storage: 10,
    price: 0,
    features: [
      '10 GB storage limit',
      'Standard video quality',
      'Ad-supported experience',
      'Limited download capabilities',
      'Basic analytics'
    ],
    recommended: false,
    current: true
  },
  {
    id: 'standard',
    name: 'Standard',
    storage: 100,
    price: 4.99,
    features: [
      '100 GB storage limit',
      'HD video quality',
      'Ad-free experience',
      'Unlimited downloads',
      'Advanced analytics'
    ],
    recommended: true,
    current: false
  },
  {
    id: 'premium',
    name: 'Premium',
    storage: 500,
    price: 9.99,
    features: [
      '500 GB storage limit',
      '4K video quality',
      'Ad-free experience',
      'Unlimited downloads',
      'Priority support',
      'Comprehensive analytics'
    ],
    recommended: false,
    current: false
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    storage: 0, // Unlimited
    price: 19.99,
    features: [
      'Unlimited storage',
      '4K+ video quality',
      'Ad-free experience',
      'Unlimited downloads',
      'Priority support',
      'Advanced encoding options',
      'Premium analytics'
    ],
    recommended: false,
    current: false
  }
];

const UpgradePage: FC = () => {
  const [selectedPlan, setSelectedPlan] = useState(storagePlans[0].id);
  const [billingCycle, setBillingCycle] = useState('monthly');
  
  // Calculate the discounted price for annual billing (20% off)
  const getPrice = (basePrice: number) => {
    if (billingCycle === 'annual') {
      return (basePrice * 12 * 0.8).toFixed(2); // 20% annual discount
    }
    return basePrice.toFixed(2);
  };
  
  return (
    <>
      <Header />
      <main className="bg-dark min-h-screen py-8">
        <div className="container-custom">
          {/* Back to Dashboard link */}
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-primary hover:underline mb-6"
          >
            <FiChevronLeft className="mr-1" /> Back to Dashboard
          </Link>
          
          <div className="bg-secondary rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="bg-secondary-light p-6 border-b border-gray-700">
              <h1 className="text-2xl font-bold flex items-center">
                <FiHardDrive className="mr-2" /> Upgrade Storage
              </h1>
            </div>
            
            <div className="p-6">
              <div className="mb-8 text-center">
                <h2 className="text-xl font-medium mb-2">Choose Your Storage Plan</h2>
                <p className="text-gray-400 max-w-lg mx-auto">
                  Upgrade your storage to save more high-quality videos and enhance your experience with premium features.
                </p>
              </div>
              
              {/* Billing Toggle */}
              <div className="flex justify-center mb-8">
                <div className="bg-secondary-light rounded-full p-1 inline-flex">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 py-2 text-sm rounded-full ${
                      billingCycle === 'monthly' ? 'bg-primary text-white' : 'text-gray-400'
                    }`}
                  >
                    Monthly Billing
                  </button>
                  <button
                    onClick={() => setBillingCycle('annual')}
                    className={`px-4 py-2 text-sm rounded-full ${
                      billingCycle === 'annual' ? 'bg-primary text-white' : 'text-gray-400'
                    }`}
                  >
                    Annual Billing <span className="text-xs bg-green-800 text-green-200 px-1 py-0.5 rounded ml-1">Save 20%</span>
                  </button>
                </div>
              </div>
              
              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {storagePlans.map((plan) => (
                  <div 
                    key={plan.id}
                    className={`bg-dark rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedPlan === plan.id ? 'border-primary' : 
                      plan.recommended ? 'border-green-600' : 'border-gray-700'
                    }`}
                  >
                    {plan.recommended && (
                      <div className="bg-green-600 text-center py-1">
                        <span className="text-xs font-bold uppercase">Recommended</span>
                      </div>
                    )}
                    
                    {plan.current && selectedPlan !== plan.id && (
                      <div className="bg-blue-800 text-center py-1">
                        <span className="text-xs font-bold uppercase">Current Plan</span>
                      </div>
                    )}
                    
                    <div className="p-5">
                      <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                      <div className="text-3xl font-bold mb-1 text-primary">
                        {plan.price === 0 ? 'Free' : `$${getPrice(plan.price)}`}
                        {billingCycle === 'monthly' && plan.price > 0 && (
                          <span className="text-sm text-gray-400">/month</span>
                        )}
                        {billingCycle === 'annual' && plan.price > 0 && (
                          <span className="text-sm text-gray-400">/year</span>
                        )}
                      </div>
                      <div className="mb-4 text-xs text-gray-400">
                        {plan.storage === 0 ? 'Unlimited Storage' : `${plan.storage} GB Storage`}
                      </div>
                      
                      <ul className="mb-5 space-y-2 min-h-[160px]">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <FiCheck className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <button
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`w-full py-2 rounded-md font-medium ${
                          selectedPlan === plan.id 
                            ? 'bg-primary text-white'
                            : plan.current && selectedPlan !== plan.id
                            ? 'bg-blue-800 text-white' 
                            : 'bg-secondary hover:bg-secondary-light text-white'
                        }`}
                        disabled={plan.current && selectedPlan !== plan.id}
                      >
                        {selectedPlan === plan.id ? 'Selected' : 
                         plan.current && selectedPlan !== plan.id ? 'Current Plan' : 'Select'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Summary and Checkout Section */}
              {selectedPlan !== storagePlans[0].id && (
                <div className="bg-dark rounded-lg p-6 border border-gray-700">
                  <h3 className="text-xl font-bold mb-4">Order Summary</h3>
                  
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                      <div className="text-lg font-medium mb-1">
                        {storagePlans.find(p => p.id === selectedPlan)?.name} Plan - {billingCycle === 'monthly' ? 'Monthly' : 'Annual'} Billing
                      </div>
                      <div className="text-gray-400">
                        {storagePlans.find(p => p.id === selectedPlan)?.storage === 0 
                          ? 'Unlimited Storage' 
                          : `${storagePlans.find(p => p.id === selectedPlan)?.storage} GB Storage`}
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0">
                      <div className="text-2xl font-bold">
                        ${getPrice(storagePlans.find(p => p.id === selectedPlan)?.price || 0)}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {billingCycle === 'monthly' ? 'per month' : 'per year, billed annually'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 p-4 rounded-lg mb-6">
                    <div className="flex items-start">
                      <FiCheckCircle className="text-green-500 mt-1 mr-2" />
                      <div>
                        <h4 className="font-medium">Upgrade Benefits</h4>
                        <ul className="text-gray-400 text-sm mt-1 space-y-1">
                          <li>- Increased storage space for your videos</li>
                          <li>- Access to premium features and higher quality</li>
                          <li>- Priority customer support</li>
                          <li>- Cancel or downgrade anytime</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Link href="/dashboard/payment" className="btn-primary inline-flex items-center px-8 py-3">
                      Proceed to Payment <FiArrowRight className="ml-2" />
                    </Link>
                    <div className="flex items-center justify-center mt-4 text-sm text-gray-400">
                      <FiLock className="mr-1" /> Secure payment process
                    </div>
                  </div>
                </div>
              )}
              
              {/* Features Comparison */}
              <div className="mt-10">
                <h3 className="text-xl font-bold mb-6 text-center">Features Comparison</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-secondary-light">
                        <th className="py-3 px-4 text-left">Feature</th>
                        {storagePlans.map((plan) => (
                          <th key={plan.id} className="py-3 px-4 text-center">{plan.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-700">
                        <td className="py-3 px-4 font-medium">Storage</td>
                        {storagePlans.map((plan) => (
                          <td key={plan.id} className="py-3 px-4 text-center">
                            {plan.storage === 0 ? 'Unlimited' : `${plan.storage} GB`}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-3 px-4 font-medium">Video Quality</td>
                        {storagePlans.map((plan, index) => (
                          <td key={plan.id} className="py-3 px-4 text-center">
                            {index === 0 ? 'Standard' : 
                             index === 1 ? 'HD' : 
                             index === 2 ? '4K' : '4K+'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-3 px-4 font-medium">Ad-Free Experience</td>
                        {storagePlans.map((plan, index) => (
                          <td key={plan.id} className="py-3 px-4 text-center">
                            {index === 0 ? 
                              <span className="text-red-500">✕</span> : 
                              <span className="text-green-500">✓</span>}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-3 px-4 font-medium">Downloads</td>
                        {storagePlans.map((plan, index) => (
                          <td key={plan.id} className="py-3 px-4 text-center">
                            {index === 0 ? 'Limited' : 'Unlimited'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-3 px-4 font-medium">Priority Support</td>
                        {storagePlans.map((plan, index) => (
                          <td key={plan.id} className="py-3 px-4 text-center">
                            {index <= 1 ? 
                              <span className="text-red-500">✕</span> : 
                              <span className="text-green-500">✓</span>}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-3 px-4 font-medium">Analytics</td>
                        {storagePlans.map((plan, index) => (
                          <td key={plan.id} className="py-3 px-4 text-center">
                            {index === 0 ? 'Basic' : 
                             index === 1 ? 'Advanced' : 
                             index === 2 ? 'Comprehensive' : 'Premium'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">Price</td>
                        {storagePlans.map((plan) => (
                          <td key={plan.id} className="py-3 px-4 text-center font-bold">
                            {plan.price === 0 ? 'Free' : 
                             billingCycle === 'monthly' ? 
                             `$${plan.price.toFixed(2)}/mo` : 
                             `$${(plan.price * 12 * 0.8).toFixed(2)}/yr`}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* FAQ Section */}
              <div className="mt-10">
                <h3 className="text-xl font-bold mb-6 text-center">Frequently Asked Questions</h3>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="bg-dark p-5 rounded-lg border border-gray-700">
                    <h4 className="font-bold mb-2">How is my storage calculated?</h4>
                    <p className="text-gray-400 text-sm">
                      Storage is calculated based on the combined size of all your uploaded videos, thumbnails, and other media content.
                    </p>
                  </div>
                  
                  <div className="bg-dark p-5 rounded-lg border border-gray-700">
                    <h4 className="font-bold mb-2">Can I downgrade later?</h4>
                    <p className="text-gray-400 text-sm">
                      Yes, you can downgrade your plan at any time. If you downgrade, you'll need to ensure your 
                      storage usage is below the new plan's limit, or you may need to delete some content.
                    </p>
                  </div>
                  
                  <div className="bg-dark p-5 rounded-lg border border-gray-700">
                    <h4 className="font-bold mb-2">Is there a refund policy?</h4>
                    <p className="text-gray-400 text-sm">
                      We offer a 7-day money-back guarantee for all new subscriptions. If you're not satisfied, 
                      you can cancel within 7 days for a full refund.
                    </p>
                  </div>
                  
                  <div className="bg-dark p-5 rounded-lg border border-gray-700">
                    <h4 className="font-bold mb-2">What payment methods are accepted?</h4>
                    <p className="text-gray-400 text-sm">
                      We accept all major credit cards, debit cards, and PayPal for payment. All transactions 
                      are secure and encrypted.
                    </p>
                  </div>
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

export default UpgradePage; 