import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Shield, User, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, signOut, userProfile, refreshProfile } = useSupabaseAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  // Effect to verify admin status once a user is authenticated
  useEffect(() => {
    if (user) {
      // If we have profile data, check immediately
      if (userProfile) {
        checkAdminRole(userProfile);
      } else {
        // If not, fetch it directly to be sure (handling async nature)
        refreshProfile();
      }
    }
  }, [user, userProfile]);

  const checkAdminRole = (profile) => {
    if (profile?.role_type === 'admin') {
      toast({
        title: 'Admin Access Granted',
        description: 'Welcome to the dashboard.',
      });
      navigate('/admin');
    } else {
      console.warn('User logged in but role_type is not admin:', profile?.role_type);
      setError('Access denied. Admin privileges required.');
      signOut();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Attempt sign in
      const { error: signInError } = await signIn(formData.email, formData.password);
      
      if (signInError) {
        // Fallback for demo admin account: if it doesn't exist, create it with role_type = 'admin'
        if (formData.email === 'admin@ecommerce.com' && formData.password === 'admin123') {
            console.log("Demo admin not found, attempting to create...");
            
            // Pass role_type: 'admin' in metadata so trigger picks it up
            const { data: signUpData, error: signUpError } = await signUp(formData.email, formData.password, {
              full_name: 'System Administrator',
              role_type: 'admin'
            });
            
            if (signUpError) {
                console.error("Auto-creation failed:", signUpError);
                throw signInError; // Throw original error
            }
            
            if (signUpData?.user) {
                toast({
                    title: 'Setting up Admin',
                    description: 'Initializing admin account...',
                });
                return; // Let the useEffect handle the rest
            }
        }
        throw signInError;
      }
      
      // If sign in success, useEffect will trigger checkAdminRole
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid credentials or login failed.');
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login - ShopVibe</title>
        <meta name="description" content="Sign in to ShopVibe admin panel" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md border border-gray-100"
        >
          <div className="text-center mb-8">
            <Shield className="h-16 w-16 mx-auto mb-4 text-blue-900" />
            <h1 className="text-3xl font-bold mb-2 text-gray-900">Admin Portal</h1>
            <p className="text-gray-600">Secure access for administrators</p>
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
                  placeholder="admin@ecommerce.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
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
                  Authenticating...
                </>
              ) : (
                'Access Dashboard'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center border-t border-gray-200 pt-6">
            <Link to="/login">
              <Button variant="outline" className="w-full rounded-full border-gray-300 text-blue-900 hover:bg-blue-50">
                <User className="mr-2 h-5 w-5" />
                Login as Customer
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AdminLogin;