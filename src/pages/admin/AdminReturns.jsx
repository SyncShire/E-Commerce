
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { Search, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/currency';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminReturns = () => {
  const { toast } = useToast();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('returns')
      .select('*, orders(order_number, total_amount)')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      setReturns(data || []);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (returnId, newStatus) => {
    try {
      const { error } = await supabase
        .from('returns')
        .update({ status: newStatus })
        .eq('id', returnId);

      if (error) throw error;
      
      toast({ title: 'Return status updated' });
      setReturns(returns.map(r => r.id === returnId ? { ...r, status: newStatus } : r));
      if (selectedReturn?.id === returnId) {
        setSelectedReturn({ ...selectedReturn, status: newStatus });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const openDetail = (ret) => {
    setSelectedReturn(ret);
    setIsDetailOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1"/> Approved</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1"/> Rejected</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><AlertCircle className="w-3 h-3 mr-1"/> Pending</Badge>;
      case 'refunded': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Refunded</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredReturns = returns.filter(ret => 
    ret.orders?.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    ret.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Returns - Admin Panel</title>
      </Helmet>

      <div>
        <h1 className="text-4xl font-bold mb-8 text-[#102a43]">Returns</h1>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-100 flex items-center">
            <Search className="h-5 w-5 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search by Order # or Reason..." 
              className="flex-1 outline-none text-sm text-slate-700 placeholder-slate-400 bg-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#102a43]">Order #</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#102a43]">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#102a43]">Reason</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#102a43]">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#102a43]">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-[#102a43]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading returns...</td></tr>
                ) : filteredReturns.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500">No returns found.</td></tr>
                ) : (
                  filteredReturns.map((ret) => (
                    <tr key={ret.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-slate-800">{ret.orders?.order_number || 'N/A'}</td>
                      <td className="px-6 py-4 text-slate-600">{new Date(ret.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{ret.reason}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{formatCurrency(ret.refund_amount || 0)}</td>
                      <td className="px-6 py-4">{getStatusBadge(ret.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openDetail(ret)} className="text-slate-500 hover:text-[#102a43] hover:bg-slate-100">
                          <Eye className="h-4 w-4 mr-2" /> Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-[500px] bg-white text-gray-900 border border-slate-200 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-[#102a43] font-semibold text-xl">Return Request Details</DialogTitle>
              <DialogDescription className="text-slate-500">
                Review and update return status.
              </DialogDescription>
            </DialogHeader>
            
            {selectedReturn && (
              <div className="space-y-6 py-4">
                <div className="bg-slate-50 p-4 rounded-lg space-y-2 border border-slate-100">
                  <div className="flex justify-between">
                     <span className="text-slate-500">Order #:</span>
                     <span className="font-medium text-slate-800">{selectedReturn.orders?.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-slate-500">Refund Amount:</span>
                     <span className="font-medium text-slate-800">{formatCurrency(selectedReturn.refund_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-slate-500">Date Requested:</span>
                     <span className="font-medium text-slate-800">{new Date(selectedReturn.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                   <h3 className="font-medium text-[#102a43]">Reason for Return</h3>
                   <p className="text-sm text-slate-600 bg-white border border-slate-200 p-3 rounded-md">
                     {selectedReturn.reason}
                   </p>
                </div>

                <div className="space-y-2">
                   <h3 className="font-medium text-[#102a43]">Update Status</h3>
                   <Select 
                     value={selectedReturn.status} 
                     onValueChange={(val) => handleStatusUpdate(selectedReturn.id, val)}
                   >
                     <SelectTrigger className="bg-white text-slate-900 border-slate-300 focus:ring-[#102a43]">
                       <SelectValue placeholder="Select Status" />
                     </SelectTrigger>
                     <SelectContent className="bg-white border-slate-200 text-slate-900">
                       <SelectItem value="pending">Pending</SelectItem>
                       <SelectItem value="approved">Approve Return</SelectItem>
                       <SelectItem value="rejected">Reject Return</SelectItem>
                       <SelectItem value="refunded">Mark as Refunded</SelectItem>
                     </SelectContent>
                   </Select>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AdminReturns;
