import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service - WebcamRips',
  description: 'WebcamRips Terms of Service - Rules and guidelines for using our platform',
};

const TermsPage = () => {
  return (
    <>
      <Header />
      <main className="bg-secondary min-h-screen py-10">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-gray-400 mb-8">
            Last updated: June 15, 2023
          </p>
          
          <div className="bg-dark rounded-lg p-8 mb-8">
            <div className="prose prose-invert max-w-none">
              <p>
                Welcome to WebcamRips. These Terms of Service govern your use of our website located at webcamrips.com (the "Service") operated by WebcamRips ("us", "we", or "our").
              </p>
              <p>
                By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
              </p>
              
              <h2 className="text-xl font-bold mt-8 mb-4">1. Age Restrictions</h2>
              <p>
                The Service is intended only for access and use by individuals at least eighteen (18) years old. By accessing or using the Service, you warrant and represent that you are at least eighteen (18) years of age and have the full authority, right, and capacity to enter into this agreement and abide by all of the terms and conditions of these Terms. If you are not at least eighteen (18) years old, you are prohibited from both the access and usage of the Service.
              </p>
              
              <h2 className="text-xl font-bold mt-8 mb-4">2. Accounts</h2>
              <p>
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
              </p>
              <p>
                You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
              </p>
              <p>
                You may not use as a username the name of another person or entity or that is not lawfully available for use, a name or trademark that is subject to any rights of another person or entity other than you without appropriate authorization, or a name that is otherwise offensive, vulgar or obscene.
              </p>
              
              <h2 className="text-xl font-bold mt-8 mb-4">3. Content</h2>
              <p>
                Our Service allows you to view content from various adult streaming platforms. By accessing this content, you acknowledge that:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>The content may be protected by copyright, trademark, patent, trade secret or other proprietary rights and laws.</li>
                <li>You will not distribute, download, or otherwise use any content in any way not authorized under these Terms of Service.</li>
                <li>We are not responsible for the content of any third-party websites or streams linked to or referenced from our Service.</li>
                <li>We reserve the right, but do not have any obligation, to monitor and remove any content that we consider to be objectionable or in violation of these Terms.</li>
              </ul>
              
              <h2 className="text-xl font-bold mt-8 mb-4">4. Prohibited Uses</h2>
              <p>
                You may use our Service only for lawful purposes and in accordance with these Terms. You agree not to use our Service:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>In any way that violates any applicable federal, state, local, or international law or regulation.</li>
                <li>To exploit, harm, or attempt to exploit or harm minors in any way.</li>
                <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter", "spam", or any other similar solicitation.</li>
                <li>To impersonate or attempt to impersonate WebcamRips, a WebcamRips employee, another user, or any other person or entity.</li>
                <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which, as determined by us, may harm WebcamRips or users of the Service or expose them to liability.</li>
                <li>To attempt to circumvent any content-filtering techniques we employ or to access areas or features of the Service that you are not authorized to access.</li>
                <li>To use any robot, spider, or other automatic device, process, or means to access the Service for any purpose, including monitoring or copying any of the material on the Service.</li>
                <li>To introduce any viruses, trojan horses, worms, logic bombs, or other material which is malicious or technologically harmful.</li>
              </ul>
              
              <h2 className="text-xl font-bold mt-8 mb-4">5. Intellectual Property</h2>
              <p>
                The Service and its original content (excluding third-party content provided through the Service), features, and functionality are and will remain the exclusive property of WebcamRips and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of WebcamRips.
              </p>
              
              <h2 className="text-xl font-bold mt-8 mb-4">6. DMCA Notice and Procedure</h2>
              <p>
                We respect the intellectual property rights of others. If you believe that any content available on or through the Service infringes upon any copyright you own or control, please refer to our <Link href="/dmca" className="text-primary hover:underline">DMCA Policy</Link> for the procedure to report copyright infringement.
              </p>
              
              <h2 className="text-xl font-bold mt-8 mb-4">7. Limitation of Liability</h2>
              <p>
                In no event shall WebcamRips, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.
              </p>
              
              <h2 className="text-xl font-bold mt-8 mb-4">8. Disclaimer</h2>
              <p>
                Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
              </p>
              <p>
                WebcamRips, its subsidiaries, affiliates, and its licensors do not warrant that a) the Service will function uninterrupted, secure or available at any particular time or location; b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet your requirements.
              </p>
              
              <h2 className="text-xl font-bold mt-8 mb-4">9. Termination</h2>
              <p>
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              <p>
                Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service.
              </p>
              
              <h2 className="text-xl font-bold mt-8 mb-4">10. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
              </p>
              <p>
                Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service, and supersede and replace any prior agreements we might have between us regarding the Service.
              </p>
              
              <h2 className="text-xl font-bold mt-8 mb-4">11. Changes</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
              <p>
                By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
              </p>
              
              <h2 className="text-xl font-bold mt-8 mb-4">12. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
              </p>
            </div>
          </div>
          
          <div className="flex justify-between items-center gap-6 flex-wrap">
            <Link href="/privacy" className="flex-1 bg-dark hover:bg-gray-800 transition-colors rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Privacy Policy</h3>
              <p className="text-gray-400">
                Learn how we collect, use, and protect your information.
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

export default TermsPage; 