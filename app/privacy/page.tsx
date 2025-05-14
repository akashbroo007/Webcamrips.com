import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - WebcamRips',
  description: 'WebcamRips Privacy Policy - How we collect, use, and protect your information',
};

const PrivacyPage = () => {
  return (
    <>
      <Header />
      <main className="bg-secondary min-h-screen py-10">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-gray-400 mb-8">
            Last updated: June 15, 2023
          </p>
          
          <div className="bg-dark rounded-lg p-8 mb-8">
            <div className="prose prose-invert max-w-none">
              <p>
                At WebcamRips, accessible from webcamrips.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by WebcamRips and how we use it.
              </p>
              <p>
                If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.
              </p>
              
              <h2 className="text-xl font-bold mt-8 mb-4">1. Information We Collect</h2>
              <h3 className="text-lg font-semibold mt-6 mb-2">1.1 Personal Information</h3>
              <p>
                When you register for an account, we may collect the following types of personal information:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>Email address</li>
                <li>Username</li>
                <li>IP address</li>
                <li>Browser information</li>
                <li>Device information</li>
              </ul>
              <p>
                We collect this information to provide you with our services, improve user experience, and ensure compliance with our Terms of Service.
              </p>
              
              <h3 className="text-lg font-semibold mt-6 mb-2">1.2 Age Verification</h3>
              <p>
                Due to the adult nature of our content, we may require age verification. This process is handled securely, and any identification documents provided are used solely for verification purposes and are not stored longer than necessary.
              </p>
              
              <h3 className="text-lg font-semibold mt-6 mb-2">1.3 Usage Data</h3>
              <p>
                We collect information on how you interact with our website, including:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>Pages you visit</li>
                <li>Time spent on each page</li>
                <li>Videos watched</li>
                <li>Features used</li>
                <li>Buttons clicked</li>
                <li>Search queries</li>
              </ul>
              
              <h2 className="text-xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
              <p>
                We use the collected information for various purposes:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>To provide and maintain our service</li>
                <li>To notify you about changes to our service</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information so that we can improve our service</li>
                <li>To monitor the usage of our service</li>
                <li>To detect, prevent and address technical issues</li>
                <li>To ensure compliance with our Terms of Service</li>
              </ul>
              
              <h2 className="text-xl font-bold mt-8 mb-4">3. Cookies and Tracking</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
              </p>
              <p>
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
              </p>
              
              <h2 className="text-xl font-bold mt-8 mb-4">4. Third-Party Service Providers</h2>
              <p>
                We may employ third-party companies and individuals due to the following reasons:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>To facilitate our service</li>
                <li>To provide the service on our behalf</li>
                <li>To perform service-related services</li>
                <li>To assist us in analyzing how our service is used</li>
              </ul>
              <p>
                These third parties have access to your Personal Information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
              </p>
              
              <h2 className="text-xl font-bold mt-8 mb-4">5. Security</h2>
              <p>
                We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
              </p>
              
              <h2 className="text-xl font-bold mt-8 mb-4">6. Your Data Protection Rights</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>The right to access – You have the right to request copies of your personal data.</li>
                <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</li>
                <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
                <li>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
                <li>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.</li>
                <li>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
              </ul>
              
              <h2 className="text-xl font-bold mt-8 mb-4">7. Children's Privacy</h2>
              <p>
                Our service is not intended for use by anyone under the age of 18. We do not knowingly collect personal information from children under 18. If we discover that a child under 18 has provided us with personal information, we immediately delete this from our servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we can take necessary actions.
              </p>
              
              <h2 className="text-xl font-bold mt-8 mb-4">8. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
              </p>
              <p>
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
              
              <h2 className="text-xl font-bold mt-8 mb-4">9. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
              </p>
            </div>
          </div>
          
          <div className="flex justify-between items-center gap-6 flex-wrap">
            <Link href="/terms" className="flex-1 bg-dark hover:bg-gray-800 transition-colors rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Terms of Service</h3>
              <p className="text-gray-400">
                Review our terms and conditions for using WebcamRips.
              </p>
            </Link>
            <Link href="/dmca" className="flex-1 bg-dark hover:bg-gray-800 transition-colors rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold mb-2">DMCA Policy</h3>
              <p className="text-gray-400">
                Learn about our copyright infringement reporting procedures.
              </p>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PrivacyPage; 