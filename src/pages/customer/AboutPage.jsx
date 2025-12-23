import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Heart, Users, Award } from 'lucide-react';

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About Us - ShopVibe</title>
        <meta name="description" content="Learn about ShopVibe and our mission to bring trendy fashion to everyone" />
      </Helmet>

      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 text-[#102a43]">
            About ShopVibe
          </h1>
          <p className="text-xl text-gray-600">
            We're on a mission to make trendy, affordable fashion accessible to everyone
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Heart,
              title: 'Our Passion',
              description: 'We love fashion and believe everyone deserves to express their unique style'
            },
            {
              icon: Users,
              title: 'Our Community',
              description: 'Join thousands of satisfied customers who trust ShopVibe for their fashion needs'
            },
            {
              icon: Award,
              title: 'Our Quality',
              description: 'We partner with the best brands to bring you authentic, high-quality products'
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-shadow border border-slate-100"
            >
              <item.icon className="h-12 w-12 mx-auto mb-4 text-[#102a43]" />
              <h3 className="font-bold text-xl mb-2 text-slate-900">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AboutPage;