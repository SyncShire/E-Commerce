
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Search, Menu, X, User, Heart, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import NewsletterSection from '@/components/NewsletterSection';
import { supabase } from '@/lib/customSupabaseClient';
import { formatCurrency } from '@/lib/currency';
import { config } from '@/lib/config';

const CustomerLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const {
    getCartCount
  } = useCart();
  const {
    user,
    signOut
  } = useSupabaseAuth();

  // Instant Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const {
            data
          } = await supabase.from('products').select('id, name, slug, price, images').or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`).eq('status', 'active').limit(5);
          setSearchResults(data || []);
          setShowResults(true);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const handleSearchSubmit = e => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
    }
  };
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  return <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Logo and Title */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
              <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3">
                {config.appLogo && (
                  <img src={config.appLogo} alt={config.appName} className="h-8 md:h-10 w-auto object-contain" />
                )}
                <span className={`text-2xl font-bold text-[#102a43] group-hover:text-[#243b53] transition-colors ${config.appLogo ? 'hidden md:block' : ''}`}>
                  {config.appName}
                </span>
              </motion.div>
            </Link>

            {/* Universal Search Bar - Desktop & Mobile */}
            <div className="flex-1 max-w-xl relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input type="text" placeholder="Search for products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={() => searchQuery.length > 1 && setShowResults(true)} className="w-full pl-10 pr-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#102a43] focus:ring-1 focus:ring-[#102a43]/20 transition-all outline-none text-sm text-slate-900 placeholder-slate-400" />
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                {isSearching && <Loader2 className="absolute right-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#102a43] animate-spin" />}
              </form>

              {/* Instant Results Dropdown */}
              <AnimatePresence>
                {showResults && searchResults.length > 0 && <motion.div initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: 10
              }} className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 ring-1 ring-black/5">
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Products
                      </div>
                      {searchResults.map(product => <Link key={product.id} to={`/products/${product.slug}`} onClick={() => setShowResults(false)} className="flex items-center px-4 py-3 hover:bg-slate-50 transition-colors group">
                          <div className="h-10 w-10 rounded-md bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100">
                            {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />}
                          </div>
                          <div className="ml-3 flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-slate-900 truncate group-hover:text-[#102a43]">{product.name}</p>
                            <p className="text-xs text-[#243b53] font-semibold">{formatCurrency(product.price)}</p>
                          </div>
                        </Link>)}
                      <Link to={`/search?q=${encodeURIComponent(searchQuery)}`} onClick={() => setShowResults(false)} className="block px-4 py-3 text-center text-sm font-medium text-[#102a43] bg-slate-50 hover:bg-slate-100 border-t border-slate-100">
                        View all results
                      </Link>
                    </div>
                  </motion.div>}
              </AnimatePresence>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link to="/products" className="text-sm font-medium text-slate-600 hover:text-[#102a43] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-[#102a43] after:transition-all hover:after:w-full">
                Shop
              </Link>
              <Link to="/about" className="text-sm font-medium text-slate-600 hover:text-[#102a43] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-[#102a43] after:transition-all hover:after:w-full">
                About
              </Link>
              <Link to="/contact" className="text-sm font-medium text-slate-600 hover:text-[#102a43] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-[#102a43] after:transition-all hover:after:w-full">
                Contact
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user && <Link to="/wishlist">
                  <Button variant="ghost" size="icon" className="rounded-full text-slate-600 hover:bg-slate-100 hover:text-[#102a43] hidden sm:flex">
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>}

              <Link to="/cart">
                <Button variant="ghost" size="icon" className="rounded-full text-slate-600 hover:bg-slate-100 hover:text-[#102a43] relative">
                  <ShoppingCart className="h-5 w-5" />
                  {getCartCount() > 0 && <span className="absolute -top-1 -right-1 bg-[#102a43] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-white">
                      {getCartCount()}
                    </span>}
                </Button>
              </Link>

              {user ? <div className="hidden md:flex items-center space-x-2">
                  <Link to="/account">
                    <Button variant="ghost" size="icon" className="rounded-full text-slate-600 hover:bg-slate-100 hover:text-[#102a43]">
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="rounded-full text-slate-600 hover:bg-slate-100 hover:text-[#102a43]" onClick={handleSignOut}>
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div> : <Link to="/login" className="hidden md:block">
                  <Button className="rounded-full bg-[#102a43] hover:bg-[#243b53] text-white px-6 font-medium shadow-sm hover:shadow-md transition-all">
                    Sign In
                  </Button>
                </Link>}

              <Button variant="ghost" size="icon" className="md:hidden rounded-full text-slate-600 hover:bg-slate-100 hover:text-[#102a43]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && <motion.div initial={{
          height: 0,
          opacity: 0
        }} animate={{
          height: 'auto',
          opacity: 1
        }} exit={{
          height: 0,
          opacity: 0
        }} className="md:hidden border-t border-slate-100 bg-white">
              <nav className="container mx-auto px-4 py-4 space-y-2">
                <Link to="/products" className="block px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-[#102a43] font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Shop
                </Link>
                <Link to="/about" className="block px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-[#102a43] font-medium" onClick={() => setMobileMenuOpen(false)}>
                  About
                </Link>
                <Link to="/contact" className="block px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-[#102a43] font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Contact
                </Link>
                {user ? <>
                    <Link to="/wishlist" className="block px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-[#102a43] font-medium" onClick={() => setMobileMenuOpen(false)}>
                      My Wishlist
                    </Link>
                    <Link to="/account" className="block px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-[#102a43] font-medium" onClick={() => setMobileMenuOpen(false)}>
                      My Account
                    </Link>
                    <button onClick={() => {
                handleSignOut();
                setMobileMenuOpen(false);
              }} className="block w-full text-left px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-[#102a43] font-medium">
                      Sign Out
                    </button>
                  </> : <Link to="/login" className="block px-4 py-3 rounded-lg text-[#102a43] font-bold bg-slate-50 text-center mt-4" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>}
              </nav>
            </motion.div>}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Newsletter */}
      <NewsletterSection />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-20 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="font-bold text-2xl mb-6 text-[#102a43]">
                {config.appName}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Your destination for trendy, affordable fashion and lifestyle products. Quality meets style in every purchase.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-slate-900">Shop</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link to="/products" className="hover:text-[#102a43] transition-colors">All Products</Link></li>
                <li><Link to="/products?featured=true" className="hover:text-[#102a43] transition-colors">Featured</Link></li>
                <li><Link to="/products?sale=true" className="hover:text-[#102a43] transition-colors">Sale</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-slate-900">Support</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link to="/contact" className="hover:text-[#102a43] transition-colors">Contact Us</Link></li>
                <li><Link to="/returns" className="hover:text-[#102a43] transition-colors">Returns</Link></li>
                <li><Link to="/terms" className="hover:text-[#102a43] transition-colors">Terms & Conditions</Link></li>
                <li><Link to="/privacy" className="hover:text-[#102a43] transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-slate-900">About</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link to="/about" className="hover:text-[#102a43] transition-colors">Our Story</Link></li>
                <li><Link to="/account" className="hover:text-[#102a43] transition-colors">My Account</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <p>© {new Date().getFullYear()} {config.appName}. All rights reserved.</p>
            
            {/* Powered By Section */}
            <div className="flex items-center gap-2">
              <a href="https://www.syncshire.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <span className="text-slate-500 font-medium">{config.footer.poweredByText}</span>
                <img 
                  src={config.footer.poweredByLogo} 
                  alt="Syncshire Logo" 
                  className="h-6 w-auto object-contain"
                />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default CustomerLayout;
