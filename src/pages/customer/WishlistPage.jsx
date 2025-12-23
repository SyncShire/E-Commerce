import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { formatCurrency } from '@/lib/currency';
import { useToast } from '@/components/ui/use-toast';

const WishlistPage = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('*, products(*)')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      
      if (error) throw error;
      
      setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
      toast({ title: 'Removed from wishlist' });
    } catch (error) {
      toast({ title: 'Error removing item', variant: 'destructive' });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p className="text-gray-500 mb-8">You need to be logged in to view your wishlist.</p>
        <Link to="/login">
          <Button className="rounded-full bg-blue-900 text-white">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Wishlist - ShopVibe</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 flex items-center">
          <Heart className="mr-3 h-8 w-8 text-red-500 fill-current" />
          My Wishlist
        </h1>

        {loading ? (
          <div className="text-center py-16">Loading...</div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
            <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-6">Your wishlist is empty</p>
            <Link to="/products">
              <Button className="rounded-full bg-blue-900 text-white">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group">
                <Link to={`/products/${item.products.slug}`}>
                  <div className="aspect-square bg-gray-100 relative">
                    {item.products.images && item.products.images[0] ? (
                      <img src={item.products.images[0]} alt={item.products.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate">{item.products.name}</h3>
                    <p className="text-blue-900 font-bold">{formatCurrency(item.products.price)}</p>
                  </div>
                </Link>
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="h-8 w-8 rounded-full shadow-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      removeFromWishlist(item.product_id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default WishlistPage;