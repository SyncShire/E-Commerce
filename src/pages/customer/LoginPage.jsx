import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, UserCog, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, user, userProfile } = useSupabaseAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Redirect if already logged in and profile loaded
  useEffect(() => {
    if (user && userProfile) {
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect);
    }
  }, [user, userProfile, navigate, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error: signInError } = await signIn(formData.email, formData.password);

      if (signInError) {
        if (signInError.message.includes("Email not confirmed")) {
          toast({
            variant: "warning",
            title: "Email Not Verified",
            description: "Please check your inbox and verify your email address before logging in.",
          });
        } else if (signInError.message.includes("Invalid login credentials")) {
          toast({
            variant: "error",
            title: "Login Failed",
            description: "Invalid email or password. Please try again.",
          });
        } else {
          toast({
            variant: "error",
            title: "Error",
            description: signInError.message,
          });
        }
        return; // Stop here if error
      }

      if (data?.user) {
        toast({
          variant: "success",
          title: 'Welcome back!',
          description: 'Successfully signed in.',
        });
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: "error",
        title: "Unexpected Error",
        description: "Something went wrong. Please try again later.",
      });
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