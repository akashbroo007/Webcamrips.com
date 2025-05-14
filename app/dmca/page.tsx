import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'DMCA Policy - WebcamRips',
  description: 'WebcamRips DMCA Policy - Our copyright infringement reporting procedures',
};

const DMCAPage = () => {
  return (
    <>
      <Header />
      <main className="bg-secondary min-h-screen py-10">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-2">DMCA Policy</h1>
          <p className="text-gray-400 mb-8">
            Last updated: June 15, 2023
          </p>
          
          <div className="bg-dark rounded-lg p-8 mb-8">
            <div className="prose prose-invert max-w-none">
              <p>
                WebcamRips respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act of 1998 ("DMCA"), we will respond expeditiously to claims of copyright infringement that are reported to our designated copyright agent.
              </p>
              
              <h2 className="text-xl font-bold mt-8 mb-4">1. Notification of Claimed Infringement</h2>
              <p>
                If you believe that your work has been copied in a way that constitutes copyright infringement, please provide our copyright agent with the following information:
              </p>
              <ol className="list-decimal pl-6 my-4">
                <li>An electronic or physical signature of the person authorized to act on behalf of the owner of the copyright interest.</li>
                <li>A description of the copyrighted work that you claim has been infringed.</li>
                <li>A description of where the material that you claim is infringing is located on the site, with enough detail that we may find it on the website.</li>
                <li>Your address, telephone number, and email address.</li>
                <li>A statement by you that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.</li>
                <li>A statement by you, made under penalty of perjury, that the above information in your notice is accurate and that you are the copyright owner or authorized to act on the copyright owner's behalf.</li>
              </ol>
              
              <h2 className="text-xl font-bold mt-8 mb-4">2. Counter-Notification</h2>
              <p>
                If you believe that your content that was removed (or to which access was disabled) is not infringing, or that you have the authorization from the copyright owner, the copyright owner's agent, or pursuant to the law, to post and use the material in your content, you may send a counter-notice containing the following information to our copyright agent:
              </p>
              <ol className="list-decimal pl-6 my-4">
                <li>Your physical or electronic signature.</li>
                <li>Identification of the content that has been removed or to which access has been disabled and the location at which the content appeared before it was removed or disabled.</li>
                <li>A statement that you have a good faith belief that the content was removed or disabled as a result of mistake or a misidentification of the content.</li>
                <li>Your name, address, telephone number, and email address.</li>
                <li>A statement that you consent to the jurisdiction of the federal court in [Your Jurisdiction] and a statement that you will accept service of process from the person who provided notification of the alleged infringement.</li>
              </ol>
              <p>
                If our copyright agent receives a counter-notice, we may send a copy of the counter-notice to the original complaining party informing that person that we may replace the removed content or cease disabling it in 10 business days. Unless the copyright owner files an action seeking a court order against the content provider, member or user, the removed content may be replaced, or access to it restored, in 10 to 14 business days or more after receipt of the counter-notice, at our sole discretion.
              </p>
              
              <h2 className="text-xl font-bold mt-8 mb-4">3. Repeat Infringer Policy</h2>
              <p>
                In accordance with the DMCA and other applicable law, WebcamRips has adopted a policy of terminating, in appropriate circumstances and at WebcamRips's sole discretion, users who are deemed to be repeat infringers. WebcamRips may also at its sole discretion limit access to the Service and/or terminate the accounts of any users who infringe any intellectual property rights of others, whether or not there is any repeat infringement.
              </p>
              
              <h2 className="text-xl font-bold mt-8 mb-4">4. Submitting a DMCA Notice</h2>
              <p>
                Please submit your DMCA notice to our designated Copyright Agent at:
              </p>
              <div className="bg-darker rounded-md p-6 my-6">
                <p className="mb-2">Email: dmca@webcamrips.com</p>
                <p className="mb-2">Subject Line: DMCA Notice</p>
                <p>
                  Mailing Address:<br />
                  WebcamRips Copyright Agent<br />
                  123 Privacy Lane<br />
                  Los Angeles, CA 90001<br />
                  United States
                </p>
              </div>
              <p>
                <strong>Please note:</strong> The Copyright Agent should only be contacted about alleged copyright infringement. Contact information for other matters is provided elsewhere on the site.
              </p>
              
              <h2 className="text-xl font-bold mt-8 mb-4">5. Content Removal</h2>
              <p>
                After receiving a valid DMCA notice, WebcamRips will follow the procedures provided in the DMCA, which prescribe a notice and takedown procedure, subject to the webmaster's right to submit a counter-notification claiming lawful use of the disabled works.
              </p>
              <p>
                WebcamRips will document all DMCA notices and their disposition. We maintain records of all DMCA notices received and how they were resolved. We take copyright infringement seriously and will act expeditiously to remove infringing content once properly notified.
              </p>
              
              <h2 className="text-xl font-bold mt-8 mb-4">6. Modifications to Policy</h2>
              <p>
                WebcamRips reserves the right to modify this DMCA Policy at any time. Changes and clarifications will take effect immediately upon their posting on the website. We encourage users to check this page periodically for updates or changes.
              </p>
              
              <h2 className="text-xl font-bold mt-8 mb-4">7. Contact Us</h2>
              <p>
                If you have any questions about this DMCA Policy, please <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
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
            <Link href="/privacy" className="flex-1 bg-dark hover:bg-gray-800 transition-colors rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Privacy Policy</h3>
              <p className="text-gray-400">
                Learn how we collect, use, and protect your personal information.
              </p>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default DMCAPage; 