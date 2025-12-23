import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';

const ReturnsPage = () => {
  return (
    <>
      <Helmet>
        <title>Returns Policy - ShopVibe</title>
        <meta name="description" content="Learn about our returns and refund policy" />
      </Helmet>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-bold mb-8">Returns Policy</h1>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-600">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">30-Day Return Policy</h2>
              <p>We want you to be completely satisfied with your purchase. If you're not happy, you can return most items within 30 days of delivery for a full refund.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Return Requirements</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Items must be unused and in original condition</li>
                <li>Original tags and packaging must be intact</li>
                <li>Proof of purchase required</li>
                <li>Some items may be non-returnable for hygiene reasons</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Return</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Log into your account and navigate to your order history</li>
                <li>Select the items you wish to return</li>
                <li>Print the prepaid return label</li>
                <li>Package your items securely</li>
                <li>Drop off at any authorized shipping location</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Refund Processing</h2>
              <p>Once we receive your return, we'll inspect the items and process your refund within 5-7 business days. The refund will be issued to your original payment method.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ReturnsPage;