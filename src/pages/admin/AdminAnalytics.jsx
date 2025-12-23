
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { 
  BarChart3, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/lib/customSupabaseClient';
import { formatCurrency } from '@/lib/currency';
import { config } from '@/lib/config';

const AdminAnalytics = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch Orders for metrics
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, created_at, user_id')
        .neq('status', 'cancelled'); // Exclude cancelled orders

      if (ordersError) throw ordersError;

      // Calculate Metrics
      const totalRevenue = ordersData.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
      const totalOrders = ordersData.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Count unique customers
      const uniqueCustomers = new Set(ordersData.map(o => o.user_id).filter(Boolean)).size;

      setStats({
        totalRevenue,
        totalOrders,
        totalCustomers: uniqueCustomers,
        averageOrderValue
      });

      // Fetch Recent Orders for list
      const { data: recent, error: recentError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (recentError) throw recentError;
      setRecentOrders(recent || []);

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (config.analytics?.enabled) {
      fetchAnalyticsData();
    }
  }, []);

  // Check if analytics is enabled - MOVED AFTER HOOKS to prevent React Hook Error
  if (!config.analytics?.enabled) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="bg-slate-50 p-6 rounded-full mb-6">
          <BarChart3 className="h-12 w-12 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Analytics Disabled</h2>
        <p className="text-slate-500 max-w-md">
          Analytics dashboard is currently disabled. Enable it in your environment configuration to view store metrics.
        </p>
      </div>
    );
  }

  const MetricCard = ({ title, value, icon: Icon, subtext, trend }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-slate-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-[#102a43]">{value}</div>
        <p className="text-xs text-slate-500 flex items-center mt-1">
          {trend === 'up' ? (
            <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
          )}
          <span className={trend === 'up' ? 'text-green-600' : 'text-slate-500'}>
            {subtext}
          </span>
        </p>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Helmet>
        <title>Analytics - Admin Panel</title>
      </Helmet>

      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#102a43]">Dashboard Overview</h1>
          <div className="text-sm text-slate-500">Last updated: {new Date().toLocaleTimeString()}</div>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-xl bg-slate-100 animate-pulse"></div>
             ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard 
              title="Total Revenue" 
              value={formatCurrency(stats.totalRevenue)} 
              icon={DollarSign}
              subtext="+20.1% from last month"
              trend="up"
            />
            <MetricCard 
              title="Total Orders" 
              value={stats.totalOrders} 
              icon={ShoppingBag}
              subtext="+15% from last month"
              trend="up"
            />
            <MetricCard 
              title="Active Customers" 
              value={stats.totalCustomers} 
              icon={Users}
              subtext="+7% new customers"
              trend="up"
            />
            <MetricCard 
              title="Avg. Order Value" 
              value={formatCurrency(stats.averageOrderValue)} 
              icon={CreditCard}
              subtext="+4% from last month"
              trend="up"
            />
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[200px] flex items-center justify-center bg-slate-50 rounded-lg border border-slate-100 border-dashed text-slate-400 text-sm">
                Chart visualization coming soon
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                      <ShoppingBag className="h-5 w-5 text-blue-900" />
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none text-slate-900">{order.shipping_address?.fullName || 'Guest Customer'}</p>
                      <p className="text-xs text-slate-500">{order.shipping_address?.email || 'No email'}</p>
                    </div>
                    <div className="ml-auto font-medium text-slate-900">{formatCurrency(order.total_amount)}</div>
                  </div>
                ))}
                {recentOrders.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No recent sales found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminAnalytics;
