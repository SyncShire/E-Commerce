import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';

const TermsPage = () => {
  return (
    <>
      <Helmet>
        <title>Terms & Conditions - ShopVibe</title>
        <meta name="description" content="Read our terms and conditions" />
      </Helmet>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-bold mb-8">Terms & Conditions</h1>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-600">
            <p className="text-sm text-gray-500">Last updated: January 2025</p>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using ShopVibe, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
              <p>Permission is granted to temporarily download one copy of the materials on ShopVibe's website for personal, non-commercial transitory viewing only.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Disclaimer</h2>
              <p>The materials on ShopVibe's website are provided on an 'as is' basis. ShopVibe makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Limitations</h2>
              <p>In no event shall ShopVibe or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ShopVibe's website.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Contact Information</h2>
              <p>If you have any questions about these Terms, please contact us at legal@shopvibe.com</p>
            </section>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default TermsPage;