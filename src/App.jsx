import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { CartProvider } from '@/contexts/CartContext';
import ScrollToTop from '@/components/ScrollToTop';

// Customer Pages
import HomePage from '@/pages/customer/HomePage';
import ProductsPage from '@/pages/customer/ProductsPage';
import ProductDetailPage from '@/pages/customer/ProductDetailPage';
import CartPage from '@/pages/customer/CartPage';
import CheckoutPage from '@/pages/customer/CheckoutPage';
import PaymentPage from '@/pages/customer/PaymentPage';
import AccountPage from '@/pages/customer/AccountPage';
import WishlistPage from '@/pages/customer/WishlistPage';
import LoginPage from '@/pages/customer/LoginPage';
import RegisterPage from '@/pages/customer/RegisterPage';
import ForgotPasswordPage from '@/pages/customer/ForgotPasswordPage';
import AboutPage from '@/pages/customer/AboutPage';
import ContactPage from '@/pages/customer/ContactPage';
import ReturnsPage from '@/pages/customer/ReturnsPage';
import TermsPage from '@/pages/customer/TermsPage';
import PrivacyPage from '@/pages/customer/PrivacyPage';
import SearchPage from '@/pages/customer/SearchPage';

// Admin Pages
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminBrands from '@/pages/admin/AdminBrands';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminReturns from '@/pages/admin/AdminReturns';
import AdminCustomers from '@/pages/admin/AdminCustomers';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';

// Layouts
import CustomerLayout from '@/layouts/CustomerLayout';
import AdminLayout from '@/layouts/AdminLayout';

function App() {
  return (
    <SupabaseAuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Customer Routes */}
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:slug" element={<ProductDetailPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/returns" element={<ReturnsPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="brands" element={<AdminBrands />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="returns" element={<AdminReturns />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="analytics" element={<AdminAnalytics />} />
            </Route>
          </Routes>
          <Toaster />
        </Router>
      </CartProvider>
    </SupabaseAuthProvider>
  );
}

export default App;