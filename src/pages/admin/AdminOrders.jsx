
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Search, Eye, CheckCircle, Clock, XCircle, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { formatCurrency } from '@/lib/currency';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const AdminOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      toast({ title: 'Order status updated' });
      
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const viewOrderDetails = async (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100"><CheckCircle className="w-3 h-3 mr-1"/> Completed</Badge>;
      case 'processing': return <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"><Clock className="w-3 h-3 mr-1"/> Processing</Badge>;
      case 'shipped': return <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100"><Truck className="w-3 h-3 mr-1"/> Shipped</Badge>;
      case 'cancelled': return <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-100"><XCircle className="w-3 h-3 mr-1"/> Cancelled</Badge>;
      default: return <Badge variant="outline" className="text-slate-600 bg-slate-50">{status}</Badge>;
    }
  };

  const filteredOrders = orders.filter(order => 
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.id.includes(searchTerm)
  );

  return (
    <>
      <Helmet>
        <title>Orders - Admin Panel</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-bold mb-8 text-[#102a43]">Orders</h1>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="p-4 border-b border-slate-100 flex items-center">
            <Search className="h-5 w-5 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search by Order # or ID..." 
              className="flex-1 outline-none text-sm text-slate-700 placeholder-slate-400 bg-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#102a43] uppercase tracking-wider">Order #</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#102a43] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#102a43] uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#102a43] uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#102a43] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-[#102a43] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-500">Loading orders...</td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-500">No orders found.</td></tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-[#102a43]">{order.order_number}</td>
                      <td className="px-6 py-4 text-slate-600">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-slate-600 text-sm">{order.shipping_address?.fullName || 'Guest'}</td>
                      <td className="px-6 py-4 font-semibold text-[#102a43]">{formatCurrency(order.total_amount)}</td>
                      <td className="px-6 py-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => viewOrderDetails(order)} className="text-slate-500 hover:text-[#102a43] hover:bg-slate-100">
                          <Eye className="h-4 w-4 mr-2" /> View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white text-slate-900 border border-slate-200 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-[#102a43] font-semibold text-xl">Order Details</DialogTitle>
              <DialogDescription className="text-slate-500">Order #{selectedOrder?.order_number}</DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6 py-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4 p-5 bg-slate-50 rounded-lg border border-slate-100">
                   <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Order Date</p>
                      <p className="font-medium text-[#102a43]">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                   </div>
                   <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Amount</p>
                      <p className="font-bold text-lg text-[#102a43]">{formatCurrency(selectedOrder.total_amount)}</p>
                   </div>
                   <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Status</p>
                      <Select 
                        value={selectedOrder.status} 
                        onValueChange={(val) => handleStatusUpdate(selectedOrder.id, val)}
                      >
                        <SelectTrigger className="w-[140px] h-9 text-sm bg-white text-slate-900 border-slate-300 focus:ring-[#102a43] focus:border-[#102a43]">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-slate-900">
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-[#102a43] border-b border-slate-200 pb-2">Shipping Details</h3>
                    <div className="text-sm text-slate-600 space-y-1.5">
                      <p><span className="font-medium text-slate-800">Name:</span> {selectedOrder.shipping_address?.fullName}</p>
                      <p><span className="font-medium text-slate-800">Address:</span> {selectedOrder.shipping_address?.address}</p>
                      <p><span className="font-medium text-slate-800">Location:</span> {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.zipCode}</p>
                      <p><span className="font-medium text-slate-800">Country:</span> {selectedOrder.shipping_address?.country}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                     <h3 className="font-semibold text-[#102a43] border-b border-slate-200 pb-2">Payment Info</h3>
                     <div className="text-sm text-slate-600 space-y-1.5">
                       <p><span className="font-medium text-slate-800">Method:</span> {selectedOrder.payment_method}</p>
                       <p><span className="font-medium text-slate-800">Payment Status:</span> {selectedOrder.payment_status}</p>
                       {selectedOrder.razorpay_payment_id && (
                         <p><span className="font-medium text-slate-800">Transaction ID:</span> {selectedOrder.razorpay_payment_id}</p>
                       )}
                     </div>
                  </div>
                </div>
                
                {selectedOrder.notes && (
                    <div className="bg-amber-50 p-4 rounded-lg text-sm text-amber-900 border border-amber-100">
                        <span className="font-bold block mb-1">Notes:</span> {selectedOrder.notes}
                    </div>
                )}
                
                <div className="text-center pt-4 border-t border-slate-100 mt-4">
                    <p className="text-xs text-slate-400 font-mono">ID: {selectedOrder.id}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AdminOrders;
