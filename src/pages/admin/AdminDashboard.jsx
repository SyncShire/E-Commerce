import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Users, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { formatCurrency } from '@/lib/currency';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // We query 'users' (public table) instead of 'auth.users' which is restricted
    const [products, orders, users] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact' }),
      supabase.from('orders').select('id, total_amount', { count: 'exact' }),
      supabase.from('users').select('id', { count: 'exact' }),
    ]);

    const revenue = orders.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    setStats({
      totalProducts: products.count || 0,
      totalOrders: orders.count || 0,
      totalCustomers: users.count || 0,
      totalRevenue: revenue,
    });
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      className: 'bg-white border-l-4 border-[#102a43]',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      className: 'bg-white border-l-4 border-[#243b53]',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      className: 'bg-white border-l-4 border-[#486581]',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      className: 'bg-white border-l-4 border-[#627d98]',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - Admin Panel</title>
        <meta name="description" content="Admin dashboard overview" />
      </Helmet>

      <div>
        <h1 className="text-3xl font-bold mb-8 text-[#102a43]">Dashboard Overview</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl p-6 shadow-sm ${card.className}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-slate-50">
                  <card.icon className="h-6 w-6 text-[#102a43]" />
                </div>
              </div>
              <p className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wide">{card.title}</p>
              <p className="text-3xl font-bold text-[#102a43]">{card.value}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;