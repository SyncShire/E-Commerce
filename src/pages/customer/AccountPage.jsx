import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, User, MapPin, Landmark, Trash2, Plus, Edit2, ChevronLeft, ChevronRight, AlertCircle, RotateCcw, XCircle, Save } from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { config } from '@/lib/config';

const ORDERS_PAGE_SIZE = 5;

const AccountPage = () => {
    const navigate = useNavigate();
    const { user, userProfile, refreshProfile } = useSupabaseAuth();
    const { toast } = useToast();
    const [orders, setOrders] = useState([]);
    const [totalOrders, setTotalOrders] = useState(0);
    const [ordersPage, setOrdersPage] = useState(1);

    const [addresses, setAddresses] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Profile Form
    const [profileForm, setProfileForm] = useState({ full_name: '' });
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Modal States
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    // Return Modal Data
    const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
    const [returnReason, setReturnReason] = useState('');
    const [submittingReturn, setSubmittingReturn] = useState(false);

    // Forms
    const [addressForm, setAddressForm] = useState({
        first_name: '', last_name: '', phone: '', address: '', address_line2: '', city: '', state: '', zip: '', country: 'United States', is_default: false
    });
    const [bankForm, setBankForm] = useState({
        bank_name: '', account_number: '', ifsc_code: '', account_holder_name: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/login?redirect=/account');
            return;
        }
        // Lazy load non-critical data
        fetchAddresses();
        fetchBankAccounts();
    }, [user]);

    useEffect(() => {
        if (userProfile) {
            setProfileForm({ full_name: userProfile.full_name || '' });
        }
    }, [userProfile]);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user, ordersPage]);

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const from = (ordersPage - 1) * ORDERS_PAGE_SIZE;
            const to = from + ORDERS_PAGE_SIZE - 1;

            const { data, count, error } = await supabase
                .from('orders')
                .select(`*, order_items (*, products (name, images))`, { count: 'exact' })
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            setOrders(data || []);
            setTotalOrders(count || 0);
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast({ title: 'Failed to load orders', variant: 'destructive' });
        } finally {
            setLoadingOrders(false);
        }
    };

    const fetchAddresses = async () => {
        const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false });
        setAddresses(data || []);
    };

    const fetchBankAccounts = async () => {
        const { data } = await supabase.from('bank_accounts').select('*').eq('user_id', user.id);
        setBankAccounts(data || []);
    };

    // --- Profile Handler ---
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSavingProfile(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({ full_name: profileForm.full_name })
                .eq('id', user.id);

            if (error) throw error;

            await refreshProfile();
            toast({ title: 'Profile updated successfully', variant: 'success' });
        } catch (error) {
            console.error('Error updating profile:', error);
            toast({ title: 'Failed to update profile', description: error.message, variant: 'error' });
        } finally {
            setIsSavingProfile(false);
        }
    };

    // --- Cancel Order Handler ---
    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) return;

        try {
            // Use RPC for atomic operation
            const { error } = await supabase.rpc('cancel_order', { order_id_param: orderId });

            if (error) throw error;

            toast({ title: 'Order cancelled successfully', description: 'Stock has been restored.' });
            fetchOrders();
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast({ title: 'Failed to cancel order', variant: 'destructive' });
        }
    };

    // --- Return Order Handler ---
    const handleOpenReturnModal = (order) => {
        setSelectedOrderForReturn(order);
        setReturnReason('');
        setIsReturnModalOpen(true);
    };

    const handleSubmitReturn = async (e) => {
        e.preventDefault();
        if (!selectedOrderForReturn) return;

        setSubmittingReturn(true);
        try {
            const { error } = await supabase.from('returns').insert([{
                order_id: selectedOrderForReturn.id,
                user_id: user.id,
                reason: returnReason,
                status: 'requested',
                refund_amount: selectedOrderForReturn.total_amount // Simple full refund for now
            }]);

            if (error) throw error;

            // Update order status to indicate return requested
            await supabase.from('orders').update({ status: 'return_requested' }).eq('id', selectedOrderForReturn.id);

            toast({ title: 'Return requested successfully', description: 'We will review your request shortly.' });
            setIsReturnModalOpen(false);
            fetchOrders();
        } catch (error) {
            console.error("Return error", error);
            toast({ title: 'Failed to submit return request', variant: 'destructive' });
        } finally {
            setSubmittingReturn(false);
        }
    };

    const checkReturnEligibility = (orderDate) => {
        const windowDays = config.returnWindowDays || 7;
        const orderTime = new Date(orderDate).getTime();
        const currentTime = new Date().getTime();
        const diffDays = (currentTime - orderTime) / (1000 * 3600 * 24);
        return diffDays <= windowDays;
    };

    // --- Address Handlers ---
    const handleOpenAddressModal = (address = null) => {
        if (address) {
            setEditingAddress(address);
            setAddressForm(address);
        } else {
            setEditingAddress(null);
            setAddressForm({ first_name: '', last_name: '', phone: '', address: '', address_line2: '', city: '', state: '', zip: '', country: 'United States', is_default: false });
        }
        setIsAddressModalOpen(true);
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        const payload = { ...addressForm, user_id: user.id };

        if (payload.is_default) {
            await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
        }

        let error;
        if (editingAddress) {
            const { error: err } = await supabase.from('addresses').update(payload).eq('id', editingAddress.id);
            error = err;
        } else {
            if (addresses.length === 0) payload.is_default = true;
            const { error: err } = await supabase.from('addresses').insert([payload]);
            error = err;
        }

        if (error) {
            toast({ title: 'Error saving address', variant: 'destructive' });
        } else {
            toast({ title: 'Address saved successfully' });
            setIsAddressModalOpen(false);
            fetchAddresses();
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm('Delete this address?')) return;
        const { error } = await supabase.from('addresses').delete().eq('id', id);
        if (!error) {
            toast({ title: 'Address deleted' });
            fetchAddresses();
        }
    };

    const handleSetDefaultAddress = async (id) => {
        await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
        await supabase.from('addresses').update({ is_default: true }).eq('id', id);
        toast({ title: 'Default address updated' });
        fetchAddresses();
    };

    // --- Bank Handlers ---
    const handleSaveBank = async (e) => {
        e.preventDefault();
        const { error } = await supabase.from('bank_accounts').insert([{ ...bankForm, user_id: user.id }]);
        if (error) {
            toast({ title: 'Error adding bank account', variant: 'destructive' });
        } else {
            toast({ title: 'Bank account added' });
            setIsBankModalOpen(false);
            setBankForm({ bank_name: '', account_number: '', ifsc_code: '', account_holder_name: '' });
            fetchBankAccounts();
        }
    };

    const handleDeleteBank = async (id) => {
        if (!window.confirm('Delete this bank account?')) return;
        const { error } = await supabase.from('bank_accounts').delete().eq('id', id);
        if (!error) {
            toast({ title: 'Bank account deleted' });
            fetchBankAccounts();
        }
    };

    const totalOrderPages = Math.ceil(totalOrders / ORDERS_PAGE_SIZE);

    return (
        <>
            <Helmet>
                <title>My Account - ShopVibe</title>
            </Helmet>

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold mb-8 text-gray-900">My Account</h1>

                <Tabs defaultValue="orders" className="w-full">
                    <TabsList className="mb-8 w-full justify-start overflow-x-auto">
                        <TabsTrigger value="orders" className="flex items-center space-x-2">
                            <Package className="h-4 w-4" />
                            <span>Orders</span>
                        </TabsTrigger>
                        <TabsTrigger value="addresses" className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>Addresses</span>
                        </TabsTrigger>
                        <TabsTrigger value="bank" className="flex items-center space-x-2">
                            <Landmark className="h-4 w-4" />
                            <span>Bank Details</span>
                        </TabsTrigger>
                        <TabsTrigger value="profile" className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>Profile</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="orders">
                        {loadingOrders ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse h-40"></div>
                                ))}
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 rounded-2xl">
                                <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg">No orders yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => {
                                    const isEligibleForReturn = ['delivered', 'completed'].includes(order.status) && checkReturnEligibility(order.created_at);
                                    const isCancellable = ['pending', 'processing'].includes(order.status);

                                    return (
                                        <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                            <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">Order #{order.order_number}</h3>
                                                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-blue-900">{formatCurrency(order.total_amount)}</p>
                                                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold capitalize
                            ${order.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                                                        order.status === 'return_requested' ? 'bg-amber-50 text-amber-700' :
                                                            'bg-blue-50 text-blue-700'}`}>
                            {order.status.replace('_', ' ')}
                          </span>
                                                </div>
                                            </div>
                                            <div className="space-y-3 mb-4">
                                                {order.order_items?.map((item) => (
                                                    <div key={item.id} className="flex gap-4">
                                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                            {item.products?.images?.[0] && (
                                                                <img src={item.products.images[0]} alt={item.products.name} className="w-full h-full object-cover" loading="lazy" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900">{item.products?.name}</p>
                                                            <div className="flex gap-4 text-sm text-gray-500">
                                                                <span>Qty: {item.quantity}</span>
                                                                {item.selected_size && <span>Size: {item.selected_size}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Order Actions */}
                                            <div className="flex gap-3 justify-end pt-2 border-t border-gray-50">
                                                {isCancellable && (
                                                    <Button variant="outline" size="sm" onClick={() => handleCancelOrder(order.id)} className="text-red-600 hover:bg-red-50 border-red-200">
                                                        <XCircle className="h-4 w-4 mr-2" /> Cancel Order
                                                    </Button>
                                                )}
                                                {isEligibleForReturn && (
                                                    <Button variant="outline" size="sm" onClick={() => handleOpenReturnModal(order)} className="text-blue-900 hover:bg-blue-50 border-blue-200">
                                                        <RotateCcw className="h-4 w-4 mr-2" /> Request Return
                                                    </Button>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {/* Orders Pagination */}
                                {totalOrderPages > 1 && (
                                    <div className="flex justify-center items-center mt-8 space-x-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={ordersPage === 1}
                                            onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <span className="text-sm">Page {ordersPage} of {totalOrderPages}</span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={ordersPage === totalOrderPages}
                                            onClick={() => setOrdersPage(p => Math.min(totalOrderPages, p + 1))}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="addresses">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
                            <Button onClick={() => handleOpenAddressModal()} className="bg-blue-900 text-white hover:bg-blue-800">
                                <Plus className="h-4 w-4 mr-2" /> Add New
                            </Button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {addresses.map(addr => (
                                <div key={addr.id} className={`p-6 rounded-2xl border ${addr.is_default ? 'border-blue-900 bg-blue-50/30' : 'border-gray-200 bg-white'} relative group`}>
                                    {addr.is_default && <span className="absolute top-4 right-4 text-xs font-bold text-blue-900 bg-blue-100 px-2 py-1 rounded">Default</span>}
                                    <h3 className="font-bold text-gray-900 mb-1">{addr.first_name} {addr.last_name}</h3>
                                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                        {addr.address}<br />
                                        {addr.address_line2 && <>{addr.address_line2}<br /></>}
                                        {addr.city}, {addr.state} {addr.zip}<br />
                                        {addr.country}<br />
                                        Phone: {addr.phone}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleOpenAddressModal(addr)}><Edit2 className="h-3 w-3 mr-1" /> Edit</Button>
                                        {!addr.is_default && <Button variant="outline" size="sm" onClick={() => handleSetDefaultAddress(addr.id)}>Set Default</Button>}
                                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteAddress(addr.id)}><Trash2 className="h-3 w-3" /></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="bank">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Bank Accounts</h2>
                            <Button onClick={() => setIsBankModalOpen(true)} className="bg-blue-900 text-white hover:bg-blue-800">
                                <Plus className="h-4 w-4 mr-2" /> Add Bank
                            </Button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {bankAccounts.map(bank => (
                                <div key={bank.id} className="p-6 rounded-2xl border border-gray-200 bg-white relative">
                                    <h3 className="font-bold text-gray-900 mb-2">{bank.bank_name}</h3>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p><span className="font-medium">Account Holder:</span> {bank.account_holder_name}</p>
                                        <p><span className="font-medium">Account No:</span> ••••••••{bank.account_number.slice(-4)}</p>
                                        <p><span className="font-medium">IFSC:</span> {bank.ifsc_code}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-4" onClick={() => handleDeleteBank(bank.id)}><Trash2 className="h-3 w-3 mr-1" /> Remove</Button>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="profile">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-xl">
                            <h2 className="text-2xl font-bold mb-6 text-gray-900">Profile Information</h2>
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-500">Email Address</label>
                                    <p className="text-gray-900 font-medium text-lg border-b border-gray-100 pb-2">{user?.email}</p>
                                </div>

                                <div>
                                    <Label htmlFor="full_name">Full Name</Label>
                                    <Input
                                        id="full_name"
                                        value={profileForm.full_name}
                                        onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                                        className="mt-1"
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button type="submit" disabled={isSavingProfile} className="bg-blue-900 text-white">
                                        {isSavingProfile ? (
                                            <>Saving...</>
                                        ) : (
                                            <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Return Modal */}
                <Dialog open={isReturnModalOpen} onOpenChange={setIsReturnModalOpen}>
                    <DialogContent className="sm:max-w-[500px] bg-white text-gray-900">
                        <DialogHeader>
                            <DialogTitle>Request Return</DialogTitle>
                            <DialogDescription>
                                For Order #{selectedOrderForReturn?.order_number}. Returns are accepted within {config.returnWindowDays} days of delivery.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmitReturn} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="return_reason">Reason for Return</Label>
                                <Textarea
                                    id="return_reason"
                                    required
                                    value={returnReason}
                                    onChange={e => setReturnReason(e.target.value)}
                                    placeholder="Please tell us why you are returning this order..."
                                    className="h-32"
                                />
                            </div>
                            <div className="bg-amber-50 p-4 rounded-lg text-sm text-amber-800 flex gap-2">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <p>Stock will only be refunded once the return is received and approved by our team.</p>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsReturnModalOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={submittingReturn} className="bg-blue-900 text-white">
                                    {submittingReturn ? 'Submitting...' : 'Submit Request'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Address Modal */}
                <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                    <DialogContent className="sm:max-w-[600px] bg-white text-gray-900">
                        <DialogHeader>
                            <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSaveAddress} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input id="first_name" required value={addressForm.first_name} onChange={e => setAddressForm({...addressForm, first_name: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input id="last_name" required value={addressForm.last_name} onChange={e => setAddressForm({...addressForm, last_name: e.target.value})} />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" required value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="address">Address Line 1</Label>
                                    <Input id="address" required value={addressForm.address} onChange={e => setAddressForm({...addressForm, address: e.target.value})} />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
                                    <Input id="address_line2" value={addressForm.address_line2 || ''} onChange={e => setAddressForm({...addressForm, address_line2: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" required value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input id="state" required value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="zip">ZIP Code</Label>
                                    <Input id="zip" required value={addressForm.zip} onChange={e => setAddressForm({...addressForm, zip: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input id="country" required value={addressForm.country} onChange={e => setAddressForm({...addressForm, country: e.target.value})} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsAddressModalOpen(false)}>Cancel</Button>
                                <Button type="submit" className="bg-blue-900 text-white">Save Address</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Bank Modal */}
                <Dialog open={isBankModalOpen} onOpenChange={setIsBankModalOpen}>
                    <DialogContent className="sm:max-w-[500px] bg-white text-gray-900">
                        <DialogHeader>
                            <DialogTitle>Add Bank Account</DialogTitle>
                            <DialogDescription>For processing refunds only.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSaveBank} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="bank_name">Bank Name</Label>
                                <Input id="bank_name" required value={bankForm.bank_name} onChange={e => setBankForm({...bankForm, bank_name: e.target.value})} placeholder="e.g. Chase Bank" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="account_holder_name">Account Holder Name</Label>
                                <Input id="account_holder_name" required value={bankForm.account_holder_name} onChange={e => setBankForm({...bankForm, account_holder_name: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="account_number">Account Number</Label>
                                <Input id="account_number" required value={bankForm.account_number} onChange={e => setBankForm({...bankForm, account_number: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ifsc_code">IFSC / Routing Code</Label>
                                <Input id="ifsc_code" required value={bankForm.ifsc_code} onChange={e => setBankForm({...bankForm, ifsc_code: e.target.value})} />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsBankModalOpen(false)}>Cancel</Button>
                                <Button type="submit" className="bg-blue-900 text-white">Save Bank Details</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </>
    );
};

export default AccountPage;