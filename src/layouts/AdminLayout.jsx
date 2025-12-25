import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  ShoppingBag,
  RotateCcw,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile, signOut, refreshProfile } = useSupabaseAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        if (!user) {
          navigate('/admin/login');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (user && userProfile) {
      if (userProfile.role_type === 'admin') {
        setIsAdmin(true);
        setLoading(false);
      } else {
        navigate('/admin/login');
      }
    } else if (user && !userProfile) {
      refreshProfile();
    }
  }, [user, userProfile, navigate, refreshProfile]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/categories', icon: FolderTree, label: 'Categories' },
    { path: '/admin/brands', icon: Tag, label: 'Brands' },
    { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { path: '/admin/returns', icon: RotateCcw, label: 'Returns' },
    { path: '/admin/customers', icon: Users, label: 'Customers' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#102a43] mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading...</p>
          </div>
        </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
      <div className="min-h-screen bg-slate-50">
        {/* Mobile Menu Button - Moved to a header bar for better spacing */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button
                variant="outline"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-md border-slate-200 text-[#102a43]"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <span className="font-bold text-lg text-[#102a43]">Admin Panel</span>
          </div>
        </div>

        {/* Sidebar */}
        <aside
            className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#102a43] text-white border-r border-[#243b53] transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen lg:fixed ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-[#243b53]">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                ShopVibe Admin
              </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const isActive = item.exact
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path);

                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                    >
                      <motion.div
                          whileHover={{ x: 4 }}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                              isActive
                                  ? 'bg-white text-[#102a43] font-semibold shadow-md'
                                  : 'text-slate-300 hover:bg-[#243b53] hover:text-white'
                          }`}
                      >
                        <item.icon className={`h-5 w-5 ${isActive ? 'text-[#102a43]' : 'text-slate-400 group-hover:text-white'}`} />
                        <span>{item.label}</span>
                      </motion.div>
                    </Link>
                );
              })}
            </nav>

            {/* Sign Out */}
            <div className="p-4 border-t border-[#243b53]">
              <Button
                  variant="ghost"
                  className="w-full rounded-lg text-slate-300 hover:bg-[#243b53] hover:text-white justify-start pl-4"
                  onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
            <div
                className="fixed inset-0 bg-[#102a43]/50 backdrop-blur-sm z-30 lg:hidden"
                onClick={() => setSidebarOpen(false)}
            />
        )}

        {/* Main Content */}
        <main className="lg:ml-64 min-h-screen">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
  );
};

export default AdminLayout;