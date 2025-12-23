import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'You have been subscribed to our newsletter.',
      });
      setEmail('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to subscribe. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-blue-950">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center text-white"
        >
          <Mail className="h-12 w-12 mx-auto mb-4 text-blue-200" />
          <h2 className="text-3xl font-bold mb-4">Stay in the Loop</h2>
          <p className="mb-8 text-blue-100">
            Subscribe to our newsletter for exclusive deals, new arrivals, and style tips!
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-6 py-3 rounded-full text-gray-900 bg-white border-2 border-transparent focus:outline-none focus:border-blue-400"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 py-3 font-semibold transition-colors"
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;