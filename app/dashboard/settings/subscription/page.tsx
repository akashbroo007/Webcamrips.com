"use client"

import { FC, useState } from 'react';
import Link from 'next/link';
import { 
  FiCreditCard, 
  FiChevronLeft, 
  FiCheck, 
  FiArrowUp, 
  FiClock, 
  FiDownload,
  FiX,
  FiAlertTriangle
} from 'react-icons/fi';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Mock subscription data
const subscriptionData = {
  status: 'active',
  plan: 'Premium',
  startDate: '2023-09-15',
  renewalDate: '2024-01-15',
  price: 9.99,
  billingCycle: 'monthly',
  paymentMethod: {
    type: 'credit_card',
    lastFour: '4242',
    expiryDate: '04/25',
    cardType: 'Visa'
  },
  features: [
    'Unlimited video views',
    'HD quality streaming',
    'Ad-free experience',
    'Download videos',
    'Early access to new content',
    'Priority customer support'
  ]
};

// Mock billing history
const billingHistory = [
  {
    id: 'inv_123456',
    date: '2023-12-15',
    amount: 9.99,
    status: 'paid',
    description: 'Premium Subscription - Monthly'
  },
  {
    id: 'inv_123455',
    date: '2023-11-15',
    amount: 9.99,
    status: 'paid',
    description: 'Premium Subscription - Monthly'
  },
  {
    id: 'inv_123454',
    date: '2023-10-15',
    amount: 9.99,
    status: 'paid',
    description: 'Premium Subscription - Monthly'
  },
  {
    id: 'inv_123453',
    date: '2023-09-15',
    amount: 9.99,
    status: 'paid',
    description: 'Premium Subscription - Monthly'
  }
];

// Mock subscription plans
const subscriptionPlans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    features: [
      'Limited video views',
      'Standard quality streaming',
      'Ad-supported experience'
    ],
    recommended: false
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    features: [
      'Unlimited video views',
      'HD quality streaming',
      'Ad-free experience',
      'Download videos',
      'Early access to new content',
      'Priority customer support'
    ],
    recommended: true
  },
  {
    id: 'premium-annual',
    name: 'Premium Annual',
    price: 99.99,
    perMonth: 8.33,
    features: [
      'All Premium features',
      'Save 17% compared to monthly',
      'Exclusive yearly bonus content'
    ],
    recommended: false
  }
];

const SubscriptionPage: FC = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  return (
    <>
      <Header />
      <main className="bg-dark min-h-screen py-8">
        <div className="container-custom">
          {/* Back to Settings link */}
          <Link 
            href="/dashboard/settings" 
            className="inline-flex items-center text-primary hover:underline mb-6"
          >
            <FiChevronLeft className="mr-1" /> Back to Settings
          </Link>
          
          <div className="bg-secondary rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="bg-secondary-light p-6 border-b border-gray-700">
              <h1 className="text-2xl font-bold flex items-center">
                <FiCreditCard className="mr-2" /> Subscription Management
              </h1>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-gray-700">
              <div className="flex">
                <button
                  className={`px-6 py-3 font-medium text-sm border-b-2 ${
                    activeTab === 'current' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('current')}
                >
                  Current Plan
                </button>
                <button
                  className={`px-6 py-3 font-medium text-sm border-b-2 ${
                    activeTab === 'plans' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('plans')}
                >
                  Plans & Pricing
                </button>
                <button
                  className={`px-6 py-3 font-medium text-sm border-b-2 ${
                    activeTab === 'billing' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('billing')}
                >
                  Billing History
                </button>
                <button
                  className={`px-6 py-3 font-medium text-sm border-b-2 ${
                    activeTab === 'payment' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('payment')}
                >
                  Payment Methods
                </button>
              </div>
            </div>
            
            {/* Current Plan Tab */}
            {activeTab === 'current' && (
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <div className="rounded-full bg-green-600 text-white p-1 mr-2">
                      <FiCheck size={16} />
                    </div>
                    <span className="text-lg font-medium">{subscriptionData.status === 'active' ? 'Active Subscription' : 'Inactive Subscription'}</span>
                  </div>
                  
                  <div className="bg-dark rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="text-lg font-bold mb-4">{subscriptionData.plan} Plan</h3>
                        <div className="text-3xl font-bold text-primary mb-2">${subscriptionData.price}<span className="text-sm text-gray-400">/month</span></div>
                        <p className="text-gray-400">
                          Billing {subscriptionData.billingCycle}. Next payment on {new Date(subscriptionData.renewalDate).toLocaleDateString()}.
                        </p>
                      </div>
                      
                      <div className="flex flex-col justify-center">
                        <div className="space-y-2">
                          {!showCancelConfirm ? (
                            <>
                              <Link 
                                href="/dashboard/upgrade" 
                                className="btn-primary w-full text-center py-2 flex items-center justify-center"
                              >
                                <FiArrowUp className="mr-2" /> Upgrade Plan
                              </Link>
                              <button 
                                className="bg-secondary-light hover:bg-opacity-80 text-white py-2 px-4 rounded-md w-full flex items-center justify-center"
                                onClick={() => setShowCancelConfirm(true)}
                              >
                                <FiX className="mr-2" /> Cancel Subscription
                              </button>
                            </>
                          ) : (
                            <div className="bg-red-900 bg-opacity-40 border border-red-700 rounded-lg p-4">
                              <div className="flex items-start">
                                <FiAlertTriangle className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                                <div>
                                  <h4 className="font-bold mb-2">Confirm Cancellation</h4>
                                  <p className="text-sm text-gray-300 mb-4">
                                    Are you sure you want to cancel your subscription? 
                                    You'll lose access to all premium features on {new Date(subscriptionData.renewalDate).toLocaleDateString()}.
                                  </p>
                                  <div className="flex space-x-2">
                                    <button 
                                      className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md text-sm"
                                      onClick={() => alert('Subscription cancelled')}
                                    >
                                      Yes, Cancel
                                    </button>
                                    <button 
                                      className="bg-secondary-light text-white py-1 px-3 rounded-md text-sm"
                                      onClick={() => setShowCancelConfirm(false)}
                                    >
                                      Keep Subscription
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Included Features:</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {subscriptionData.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <FiCheck className="text-green-500 mr-2" /> {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Payment Method</h3>
                  <div className="bg-dark rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-secondary-light p-2 rounded-md mr-3">
                        <FiCreditCard size={20} />
                      </div>
                      <div>
                        <div>{subscriptionData.paymentMethod.cardType} ending in {subscriptionData.paymentMethod.lastFour}</div>
                        <div className="text-sm text-gray-400">Expires {subscriptionData.paymentMethod.expiryDate}</div>
                      </div>
                    </div>
                    <Link href="/dashboard/settings/payment" className="text-primary hover:underline text-sm">
                      Change
                    </Link>
                  </div>
                </div>
              </div>
            )}
            
            {/* Plans Tab */}
            {activeTab === 'plans' && (
              <div className="p-6">
                <h3 className="text-xl font-bold mb-6">Available Plans</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {subscriptionPlans.map((plan) => (
                    <div 
                      key={plan.id} 
                      className={`bg-dark rounded-lg overflow-hidden border ${
                        plan.recommended ? 'border-primary' : 'border-gray-700'
                      }`}
                    >
                      {plan.recommended && (
                        <div className="bg-primary text-white text-center py-1 text-sm font-medium">
                          Recommended
                        </div>
                      )}
                      
                      <div className="p-6">
                        <h4 className="text-lg font-bold mb-2">{plan.name}</h4>
                        <div className="mb-4">
                          {plan.price === 0 ? (
                            <div className="text-2xl font-bold">Free</div>
                          ) : (
                            <div>
                              <div className="text-3xl font-bold text-primary">${plan.price}</div>
                              {plan.perMonth && (
                                <div className="text-sm text-gray-400">${plan.perMonth}/month, billed annually</div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <ul className="mb-6 space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <FiCheck className="text-green-500 mr-2 mt-1" /> 
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <button 
                          className={`w-full py-2 px-4 rounded-md ${
                            plan.name === subscriptionData.plan
                              ? 'bg-secondary-light text-white'
                              : 'bg-primary hover:bg-primary-dark text-white'
                          }`}
                          disabled={plan.name === subscriptionData.plan}
                        >
                          {plan.name === subscriptionData.plan ? 'Current Plan' : 'Select Plan'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 bg-dark p-4 rounded-lg border border-gray-700">
                  <h4 className="font-medium mb-2">Need a custom plan?</h4>
                  <p className="text-gray-400 mb-2">For enterprise solutions or special requirements, contact our sales team.</p>
                  <Link href="/contact" className="text-primary hover:underline">
                    Contact Sales
                  </Link>
                </div>
              </div>
            )}
            
            {/* Billing History Tab */}
            {activeTab === 'billing' && (
              <div className="p-6">
                <h3 className="text-xl font-bold mb-6">Billing History</h3>
                
                <div className="bg-dark rounded-lg overflow-hidden">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-secondary-light">
                        <th className="py-3 px-4 text-left text-sm font-medium">Date</th>
                        <th className="py-3 px-4 text-left text-sm font-medium">Description</th>
                        <th className="py-3 px-4 text-left text-sm font-medium">Amount</th>
                        <th className="py-3 px-4 text-left text-sm font-medium">Status</th>
                        <th className="py-3 px-4 text-left text-sm font-medium">Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingHistory.map((invoice) => (
                        <tr key={invoice.id} className="border-b border-gray-700">
                          <td className="py-3 px-4">{new Date(invoice.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4">{invoice.description}</td>
                          <td className="py-3 px-4">${invoice.amount.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              invoice.status === 'paid' 
                                ? 'bg-green-900 text-green-300' 
                                : 'bg-yellow-900 text-yellow-300'
                            }`}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button className="text-primary hover:underline flex items-center text-sm">
                              <FiDownload className="mr-1" /> PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Payment Methods Tab */}
            {activeTab === 'payment' && (
              <div className="p-6">
                <h3 className="text-xl font-bold mb-6">Payment Methods</h3>
                
                <div className="mb-6">
                  <div className="bg-dark rounded-lg p-4 border border-gray-700 flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-secondary-light p-2 rounded-md mr-3">
                        <FiCreditCard size={20} />
                      </div>
                      <div>
                        <div>{subscriptionData.paymentMethod.cardType} ending in {subscriptionData.paymentMethod.lastFour}</div>
                        <div className="text-sm text-gray-400">Expires {subscriptionData.paymentMethod.expiryDate}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-green-900 text-green-300 px-2 py-1 rounded-full text-xs mr-3">Default</span>
                      <button className="text-red-500 hover:underline text-sm">Remove</button>
                    </div>
                  </div>
                </div>
                
                <button className="btn-primary flex items-center">
                  <FiCreditCard className="mr-2" /> Add Payment Method
                </button>
                
                <div className="mt-8">
                  <h4 className="font-medium mb-3">Billing Address</h4>
                  <div className="bg-dark rounded-lg p-4 border border-gray-700">
                    <p className="text-gray-400 mb-2">Your billing address is used for verification purposes and to prevent fraud.</p>
                    <button className="text-primary hover:underline">
                      Add Billing Address
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SubscriptionPage; 