
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, UserCog, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, user, userProfile } = useSupabaseAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Redirect if already logged in and profile loaded
  useEffect(() => {
    if (user && userProfile) {
      const redirect = searchParams.get('redirect') || '/';
      // If admin accidentally logs in here, they can still go to main site, 
      // but if they want admin panel they should use admin link.
      // We just redirect to home/dashboard based on intent.
      navigate(redirect);
    }
  }, [user, userProfile, navigate, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: signInError } = await signIn(formData.email, formData.password);
      
      if (signInError) {
         setError(signInError.message || 'Invalid login credentials');
         throw signInError;
      }

      // Check role - actually logic is handled in useEffect mostly, but let's check profile here if possible
      // Profile fetching is async in context. We might just wait for the context to update.
      toast({
        title: 'Welcome back!',
        description: 'Signing you in...',
      });
      
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign In - ShopVibe</title>
        <meta name="description" content="Sign in to your ShopVibe account" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md border border-gray-100"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-blue-900">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to continue shopping</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-gray-900"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-gray-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-blue-900 hover:bg-blue-800 text-white py-6 shadow-lg shadow-blue-900/20"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-8 text-center border-t border-gray-200 pt-6">
            <Link to="/admin/login">
              <Button variant="outline" className="w-full rounded-full border-gray-300 text-blue-900 hover:bg-blue-50">
                <UserCog className="mr-2 h-5 w-5" />
                Login as Admin
              </Button>
            </Link>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
              Continue as guest
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
