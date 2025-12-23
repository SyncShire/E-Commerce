import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';

const PrivacyPage = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - ShopVibe</title>
        <meta name="description" content="Read our privacy policy" />
      </Helmet>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-bold mb-8">Privacy Policy</h1>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-600">
            <p className="text-sm text-gray-500">Last updated: January 2025</p>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
              <p>We collect information that you provide directly to us, including when you create an account, make a purchase, or contact customer support.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Send you updates about your orders</li>
                <li>Respond to your questions and concerns</li>
                <li>Improve our products and services</li>
                <li>Send you marketing communications (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
              <p>We do not sell your personal information. We may share your information with service providers who assist us in operating our website and conducting our business.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
              <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
              <p>You have the right to access, update, or delete your personal information. Contact us at privacy@shopvibe.com to exercise these rights.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default PrivacyPage;