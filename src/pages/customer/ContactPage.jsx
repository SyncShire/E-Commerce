import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
const ContactPage = () => {
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const handleSubmit = e => {
    e.preventDefault();
    toast({
      title: '🚧 Contact Form',
      description: 'Contact form submission will be implemented soon!'
    });
    setFormData({
      name: '',
      email: '',
      message: ''
    });
  };
  return <>
      <Helmet>
        <title>Contact Us - ShopVibe</title>
        <meta name="description" content="Get in touch with ShopVibe customer support" />
      </Helmet>

      <div className="container mx-auto px-4 py-16">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 text-center text-[#102a43]">Contact Us</h1>
          <p className="text-xl text-gray-600 text-center mb-12">
            Have a question? We'd love to hear from you
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-slate-900">Get in Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-[#102a43] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1 text-slate-900">+91 7349730176</h3>
                    <p className="text-gray-600">support@syncshire.com</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-[#102a43] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1 text-slate-900">Phone</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-[#102a43] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1 text-slate-900">Address</h3>
                    <p className="text-gray-600">123 Fashion Street, Style City, SC 12345</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700">Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({
                ...formData,
                name: e.target.value
              })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#102a43]" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700">Email</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({
                ...formData,
                email: e.target.value
              })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#102a43]" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700">Message</label>
                <textarea required rows={4} value={formData.message} onChange={e => setFormData({
                ...formData,
                message: e.target.value
              })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#102a43]"></textarea>
              </div>
              <Button type="submit" className="w-full rounded-full bg-[#102a43] hover:bg-[#243b53] text-white">
                <Send className="mr-2 h-5 w-5" />
                Send Message
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </>;
};
export default ContactPage;