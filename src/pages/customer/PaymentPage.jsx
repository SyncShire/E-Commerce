
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Truck, Smartphone, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { formatCurrency } from '@/lib/currency';
import { config } from '@/lib/config';
import { sendOrderConfirmationEmail } from '@/lib/emailService';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('razorpay'); // 'razorpay' (covers card/upi/netbanking) or 'cod'
  const [isCodEligible, setIsCodEligible] = useState(true);

  // Retrieve shipping info passed from CheckoutPage
  const shippingInfo = location.state?.shippingInfo;

  // Load Razorpay Script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!shippingInfo) {
      toast({
        title: 'Missing shipping info',
        description: 'Please provide shipping details first.',
        variant: 'destructive',
      });
      navigate('/checkout');
      return;
    }

    // Check COD eligibility for all items in cart
    const ineligibleItems = cartItems.filter(item => item.products && item.products.cod_eligible === false);
    if (ineligibleItems.length > 0) {
      setIsCodEligible(false);
      setSelectedMethod('razorpay');
    }
  }, [shippingInfo, cartItems, navigate, toast]);

  const handlePayment = async () => {
    if (!user) {
      navigate('/login?redirect=/payment');
      return;
    }

    setLoading(true);

    try {
      const orderNumber = `ORD-${Date.now()}`;
      const subtotal = getCartTotal();
      const shippingCost = subtotal > 50 ? 0 : 5;
      const totalAmount = subtotal + shippingCost;

      // 1. Create the Order in Pending state
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          order_number: orderNumber,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'pending',
          payment_method: selectedMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay',
          shipping_address: shippingInfo,
          billing_address: shippingInfo, // Assuming same for simplicity
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Order Items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.product_variants?.price || item.products?.price || 0,
        selected_size: item.selected_size // Ensure selected size is saved
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Handle Payment Flow
      if (selectedMethod === 'cod') {
        // COD: Finalize order immediately
        await clearCart();
        
        // Send email
        await sendOrderConfirmationEmail(order, shippingInfo.firstName, shippingInfo.email);

        toast({
          title: 'Order Placed!',
          description: `Your order #${orderNumber} has been placed successfully via Cash on Delivery.`,
        });
        navigate('/account');
      } else {
        // Razorpay Integration
        await handleRazorpayPayment(order, totalAmount);
      }

    } catch (error) {
      console.error('Order processing error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process order. Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async (order, amount) => {
    // Check if Razorpay is loaded
    if (!window.Razorpay) {
        toast({
            title: 'Payment Gateway Error',
            description: 'Razorpay SDK failed to load. Please check your internet connection.',
            variant: 'destructive'
        });
        setLoading(false);
        return;
    }

    const options = {
      key: config.razorpayKeyId, 
      amount: Math.round(amount * 100), // Amount in paise (integer)
      currency: config.currency.code, 
      name: config.appName,
      description: `Order #${order.order_number}`,
      // order_id: "order_9A33XWu170gA9a", // This would come from backend in strict mode
      
      handler: async function (response) {
        // Payment Success Handler
        // Update order status in Supabase
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'processing',
            razorpay_payment_id: response.razorpay_payment_id,
          })
          .eq('id', order.id);

        if (updateError) {
            console.error("Failed to update order status", updateError);
            toast({
                title: 'Payment Recorded but Order Update Failed',
                description: 'Please contact support with your Payment ID: ' + response.razorpay_payment_id,
                variant: 'destructive'
            });
        } else {
            await clearCart();
            // Send email
            await sendOrderConfirmationEmail(order, shippingInfo.firstName, shippingInfo.email);

            toast({
                title: 'Payment Successful!',
                description: `Your order #${order.order_number} has been placed successfully.`,
            });
            navigate('/account');
        }
      },
      prefill: {
        name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        email: shippingInfo.email,
        contact: shippingInfo.phone,
      },
      theme: {
        color: "#102a43",
      },
      modal: {
        ondismiss: function() {
            setLoading(false);
            toast({
                title: 'Payment Cancelled',
                description: 'You cancelled the payment process.',
                variant: 'destructive'
            });
        }
      }
    };

    const rzp1 = new window.Razorpay(options);
    
    rzp1.on('payment.failed', function (response){
        console.error(response.error);
        toast({
            title: 'Payment Failed',
            description: response.error.description || 'Transaction failed. Please try again.',
            variant: 'destructive'
        });
        setLoading(false);
    });

    rzp1.open();
  };

  if (!shippingInfo) return null;

  return (
    <>
      <Helmet>
        <title>Payment - {config.appName}</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Select Payment Method</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Razorpay Option */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-2xl p-6 cursor-pointer transition-all ${selectedMethod === 'razorpay' ? 'border-blue-900 ring-1 ring-blue-900 bg-blue-50/30' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => setSelectedMethod('razorpay')}
            >
                <div className="flex items-start gap-4">
                    <div className={`mt-1 h-5 w-5 rounded-full border flex items-center justify-center ${selectedMethod === 'razorpay' ? 'border-blue-900' : 'border-gray-300'}`}>
                        {selectedMethod === 'razorpay' && <div className="h-2.5 w-2.5 rounded-full bg-blue-900" />}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">Pay Online</h3>
                            <div className="flex gap-2 text-gray-400">
                                <CreditCard className="h-5 w-5" />
                                <Smartphone className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">Credit/Debit Card, UPI, NetBanking, Wallets</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded text-gray-600">Visa</span>
                            <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded text-gray-600">Mastercard</span>
                            <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded text-gray-600">UPI</span>
                            <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded text-gray-600">GPay</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* COD Option */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`border rounded-2xl p-6 cursor-pointer transition-all relative overflow-hidden ${
                    !isCodEligible ? 'opacity-60 cursor-not-allowed bg-gray-50' : 
                    selectedMethod === 'cod' ? 'border-blue-900 ring-1 ring-blue-900 bg-blue-50/30' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => isCodEligible && setSelectedMethod('cod')}
            >
                <div className="flex items-start gap-4">
                    <div className={`mt-1 h-5 w-5 rounded-full border flex items-center justify-center ${
                        !isCodEligible ? 'border-gray-200 bg-gray-100' :
                        selectedMethod === 'cod' ? 'border-blue-900' : 'border-gray-300'
                    }`}>
                        {selectedMethod === 'cod' && isCodEligible && <div className="h-2.5 w-2.5 rounded-full bg-blue-900" />}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">Cash on Delivery</h3>
                            <Truck className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">Pay with cash when your order arrives.</p>
                        
                        {!isCodEligible && (
                            <div className="mt-3 flex items-center text-xs text-red-600 bg-red-50 p-2 rounded max-w-fit">
                                <AlertCircle className="h-3 w-3 mr-1.5" />
                                Some items in your cart are not eligible for COD.
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Your transaction is secured with 256-bit SSL encryption.</span>
            </div>

            <Button
                onClick={handlePayment}
                disabled={loading}
                className="w-full rounded-full bg-blue-900 hover:bg-blue-800 text-white py-6 text-lg shadow-lg shadow-blue-900/20"
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    `Pay ${formatCurrency(getCartTotal() + (getCartTotal() > 50 ? 0 : 5))}`
                )}
            </Button>
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold mb-4 text-gray-900">Order Summary</h2>
                <div className="space-y-4 text-sm">
                    <div className="flex justify-between text-gray-600">
                        <span>Items Total</span>
                        <span>{formatCurrency(getCartTotal())}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span>{getCartTotal() > 50 ? 'Free' : formatCurrency(5)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-base">
                        <span>Total to Pay</span>
                        <span className="text-blue-900">{formatCurrency(getCartTotal() + (getCartTotal() > 50 ? 0 : 5))}</span>
                    </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="font-semibold mb-2 text-gray-900 text-sm">Shipping To:</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {shippingInfo.firstName} {shippingInfo.lastName}<br />
                        {shippingInfo.address}<br />
                        {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}<br />
                        {shippingInfo.country}<br />
                        {shippingInfo.phone}
                    </p>
                    <Button 
                        variant="link" 
                        className="p-0 h-auto text-blue-600 text-xs mt-2"
                        onClick={() => navigate('/checkout')}
                    >
                        Change Address
                    </Button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentPage;
