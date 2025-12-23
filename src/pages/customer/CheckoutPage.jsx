import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Plus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/currency';
import { supabase } from '@/lib/customSupabaseClient';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  const { cartItems, getCartTotal } = useCart();
  
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
  });

  useEffect(() => {
    if (user) {
      fetchSavedAddresses();
    }
  }, [user]);

  const fetchSavedAddresses = async () => {
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });
    
    if (data && data.length > 0) {
      setSavedAddresses(data);
      setSelectedAddressId(data[0].id);
      fillFormWithAddress(data[0]);
    }
  };

  const fillFormWithAddress = (addr) => {
    setFormData({
      firstName: addr.first_name || '',
      lastName: addr.last_name || '',
      email: addr.email || user.email,
      phone: addr.phone || '',
      address: addr.address || '',
      addressLine2: addr.address_line2 || '',
      city: addr.city || '',
      state: addr.state || '',
      zip: addr.zip || '',
      country: addr.country || 'United States',
    });
  };

  const handleAddressSelection = (val) => {
    setSelectedAddressId(val);
    if (val === 'new') {
      setFormData({
        firstName: '', lastName: '', email: user?.email || '', phone: '', address: '', addressLine2: '', city: '', state: '', zip: '', country: 'United States'
      });
    } else {
      const addr = savedAddresses.find(a => a.id === val);
      if (addr) fillFormWithAddress(addr);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContinueToPayment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to checkout',
        variant: 'destructive',
      });
      navigate('/login?redirect=/checkout');
      return;
    }

    if (selectedAddressId === 'new' && saveNewAddress) {
      // Save the new address
      const { error } = await supabase.from('addresses').insert([{
        user_id: user.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        address_line2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: formData.country,
        is_default: savedAddresses.length === 0 // Make default if it's the first one
      }]);
      
      if (error) console.error("Error saving address:", error);
    }
    
    // Pass shipping info to Payment Page
    navigate('/payment', { state: { shippingInfo: formData } });
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Checkout - ShopVibe</title>
        <meta name="description" content="Complete your purchase securely" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleContinueToPayment} className="space-y-6">
              
              {savedAddresses.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                  <h2 className="text-lg font-bold mb-4 text-gray-900">Select Shipping Address</h2>
                  <RadioGroup value={selectedAddressId} onValueChange={handleAddressSelection} className="space-y-3">
                    {savedAddresses.map((addr) => (
                      <div key={addr.id} className={`flex items-start space-x-3 p-3 rounded-lg border ${selectedAddressId === addr.id ? 'border-blue-900 bg-blue-50' : 'border-gray-200'}`}>
                        <RadioGroupItem value={addr.id} id={addr.id} />
                        <Label htmlFor={addr.id} className="cursor-pointer flex-1">
                          <div className="font-semibold text-gray-900">{addr.first_name} {addr.last_name} {addr.is_default && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded ml-2">Default</span>}</div>
                          <div className="text-sm text-gray-600">{addr.address}, {addr.city}, {addr.state} {addr.zip}</div>
                          <div className="text-sm text-gray-500">{addr.phone}</div>
                        </Label>
                      </div>
                    ))}
                    <div className={`flex items-center space-x-3 p-3 rounded-lg border ${selectedAddressId === 'new' ? 'border-blue-900 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <RadioGroupItem value="new" id="new-address" />
                      <Label htmlFor="new-address" className="cursor-pointer flex items-center font-medium text-gray-900">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Address
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {(selectedAddressId === 'new' || savedAddresses.length === 0) && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Shipping Information</h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2 text-gray-700">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-gray-900"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2 text-gray-700">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-gray-900"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2 text-gray-700">Address Line 1 *</label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-gray-900"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2 text-gray-700">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-gray-900"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">City *</label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">State *</label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">ZIP Code *</label>
                      <input
                        type="text"
                        name="zip"
                        required
                        value={formData.zip}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-gray-900"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center space-x-2">
                    <Checkbox 
                        id="save-address" 
                        checked={saveNewAddress} 
                        onCheckedChange={setSaveNewAddress}
                    />
                    <Label htmlFor="save-address" className="text-gray-700 font-medium cursor-pointer">Save this address for future orders</Label>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full rounded-full bg-blue-900 hover:bg-blue-800 text-white py-6 text-lg shadow-lg shadow-blue-900/20"
              >
                Continue to Payment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.products?.images?.[0] && (
                        <img
                          src={item.products.images[0]}
                          alt={item.products.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900 line-clamp-1">{item.products?.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      {item.selected_size && <p className="text-xs text-gray-500">Size: {item.selected_size}</p>}
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency((item.product_variants?.price || item.products?.price || 0) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(getCartTotal())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{getCartTotal() > 50 ? 'Free' : formatCurrency(5)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 text-gray-900">
                  <span>Total</span>
                  <span className="text-blue-900">
                    {formatCurrency(getCartTotal() + (getCartTotal() > 50 ? 0 : 5))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;