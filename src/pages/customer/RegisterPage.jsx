import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { signUp } = useSupabaseAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      toast({
        title: "Password too weak",
        description: "Password must be at least 6 characters long.",
        variant: "warning",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        role_type: 'customer'
      });

      if (error) {
        // Handle "User already exists" specifically
        if (error.message.includes("already registered") || error.message.includes("User already exists") || error.status === 422) {
          toast({
            variant: "error",
            title: "Registration Failed",
            description: "User already exists with this email. Please sign in instead.",
          });
        } else {
          toast({
            variant: "error",
            title: "Registration Failed",
            description: error.message || "An unexpected error occurred.",
          });
        }
        return;
      }

      // Check if session is null, which implies email confirmation is required
      if (data?.user && !data?.session) {
        setShowSuccessCard(true);
      } else if (data?.session) {
        // If auto-confirm is enabled in Supabase (unlikely for production but possible)
        toast({
          variant: "success",
          title: "Welcome to ShopVibe!",
          description: "Your account has been created successfully.",
        });
        navigate('/');
      }

    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "error",
        title: "Registration Failed",
        description: "An unexpected error occurred. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  if (showSuccessCard) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md border border-gray-100 text-center"
          >
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Verify your email</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              We've sent a verification link to <span className="font-semibold text-gray-900">{formData.email}</span>.
              Please check your inbox and click the link to activate your account.
            </p>

            <div className="space-y-4">
              <Link to="/login">
                <Button className="w-full rounded-full bg-blue-900 hover:bg-blue-800 text-white h-12">
                  Back to Sign In
                </Button>
              </Link>
              <p className="text-sm text-gray-500">
                Didn't receive the email? Check your spam folder.
              </p>
            </div>
          </motion.div>
        </div>
    );
  }

  return (
      <>
        <Helmet>
          <title>Create Account - ShopVibe</title>
          <meta name="description" content="Register for a new ShopVibe account" />
        </Helmet>

        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md border border-gray-100"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2 text-blue-900">
                Create Account
              </h1>
              <p className="text-gray-600">Join us for the best shopping experience</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-gray-900"
                      placeholder="John Doe"
                  />
                </div>
              </div>

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
                <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-gray-900"
                      placeholder="••••••••"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-2">Must be at least 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                      type="password"
                      required
                      minLength={6}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                      Creating account...
                    </>
                ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </>
  );
};

export default RegisterPage;