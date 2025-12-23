
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Truck, Shield, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/customSupabaseClient';
import { formatCurrency } from '@/lib/currency';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { config } from '@/lib/config';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { user } = useSupabaseAuth();
  
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (user && product) {
      checkFavoriteStatus();
    }
  }, [user, product]);

  const fetchProduct = async () => {
    try {
      const { data: productData } = await supabase
        .from('products')
        .select(`
          *,
          categories(name, slug),
          brands(name, slug)
        `)
        .eq('slug', slug)
        .single();

      if (productData) {
        setProduct(productData);
        if (productData.images && productData.images.length > 0) {
          setActiveImage(productData.images[0]);
        }
        
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', productData.id)
          .order('created_at', { ascending: false });
        
        setReviews(reviewsData || []);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    const { data } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .maybeSingle();
    
    setIsFavorite(!!data);
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to add items to your wishlist',
        variant: 'destructive'
      });
      return;
    }

    if (isFavorite) {
      await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', product.id);
      setIsFavorite(false);
      toast({ title: 'Removed from wishlist' });
    } else {
      await supabase
        .from('wishlist')
        .insert([{ user_id: user.id, product_id: product.id }]);
      setIsFavorite(true);
      toast({ title: 'Added to wishlist' });
    }
  };

  const handleAddToCart = async () => {
    if (product.stock_quantity <= 0) {
      toast({
        title: 'Out of Stock',
        description: 'This product is currently unavailable.',
        variant: 'destructive',
      });
      return;
    }

    // Check if sizes exist and one is selected
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({
        title: 'Select Size',
        description: 'Please select a size to continue.',
        variant: 'destructive',
      });
      return;
    }

    if (quantity > product.stock_quantity) {
       toast({
        title: 'Stock Limit',
        description: `Only ${product.stock_quantity} left in stock.`,
        variant: 'destructive',
      });
      return;
    }

    const result = await addToCart(product.id, null, quantity, selectedSize);
    if (result.success) {
      toast({
        title: 'Added to cart!',
        description: `${product.name} ${selectedSize ? `(Size: ${selectedSize})` : ''} added to cart.`,
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to add to cart. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 rounded-2xl"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Product not found</h1>
        <Link to="/products">
          <Button className="rounded-full bg-blue-900 text-white">Back to Products</Button>
        </Link>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <>
      <Helmet>
        <title>{product.name} - ShopVibe</title>
        <meta name="description" content={product.description || `Shop ${product.name} at ShopVibe`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-sm text-gray-500">
          <Link to="/" className="hover:text-blue-900">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-blue-900">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={activeImage}
              className="aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm relative"
            >
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale opacity-80' : ''}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="h-24 w-24 text-gray-300" />
                </div>
              )}
              {isOutOfStock && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <span className="bg-black/70 text-white px-4 py-2 rounded-full font-bold">Out of Stock</span>
                 </div>
              )}
            </motion.div>

            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(image)}
                    className={`aspect-square w-20 flex-shrink-0 rounded-lg overflow-hidden bg-white border transition-all ${
                      activeImage === image ? 'border-blue-900 ring-2 ring-blue-900/20' : 'border-gray-200 hover:border-blue-900'
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex justify-between items-start mb-2">
              {product.brands && (
                <p className="text-sm text-blue-600 font-semibold uppercase tracking-wider">{product.brands.name}</p>
              )}
              {product.gender && (
                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full uppercase tracking-wider font-medium">{product.gender}</span>
              )}
            </div>
            
            <h1 className="text-4xl font-bold mb-4 text-gray-900">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </span>
            </div>

            {/* Price */}
            <div className={`flex items-center space-x-4 mb-6 ${isOutOfStock ? 'opacity-50' : ''}`}>
              <span className="text-4xl font-bold text-blue-900">{formatCurrency(product.price)}</span>
              {product.compare_price && (
                <span className="text-2xl text-gray-400 line-through">{formatCurrency(product.compare_price)}</span>
              )}
            </div>
            
            {/* Stock Warning */}
            {!isOutOfStock && product.stock_quantity < 10 && (
                <div className="flex items-center text-amber-600 text-sm font-medium mb-6 bg-amber-50 p-3 rounded-lg w-fit">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Only {product.stock_quantity} left in stock!
                </div>
            )}

            {/* Description */}
            <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className={`mb-6 ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-900">Select Size</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={isOutOfStock}
                      className={`h-12 min-w-[3rem] px-4 rounded-lg border font-medium transition-all ${
                        selectedSize === size
                          ? 'bg-blue-900 text-white border-blue-900 shadow-md'
                          : 'bg-white text-gray-900 border-gray-200 hover:border-blue-900'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {!selectedSize && !isOutOfStock && (
                  <p className="text-red-500 text-sm mt-2">* Please select a size</p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className={`mb-8 ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
              <h3 className="font-semibold mb-3 text-gray-900">Quantity</h3>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-gray-300"
                  disabled={isOutOfStock || quantity <= 1}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="text-xl font-semibold w-12 text-center text-gray-900">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-gray-300"
                  disabled={isOutOfStock || quantity >= product.stock_quantity}
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                className={`flex-1 rounded-full py-6 shadow-lg transition-all ${isOutOfStock ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-blue-900 hover:bg-blue-800 text-white shadow-blue-900/20'}`}
                onClick={handleAddToCart}
                disabled={isOutOfStock || (product.sizes && product.sizes.length > 0 && !selectedSize)}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isOutOfStock ? 'Out of Stock' : (product.sizes && product.sizes.length > 0 && !selectedSize ? 'Select Size' : 'Add to Cart')}
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className={`rounded-full h-12 w-12 border-gray-300 transition-colors ${isFavorite ? 'bg-red-50 text-red-500 border-red-200' : 'text-gray-500 hover:text-red-500 hover:border-red-200'}`}
                onClick={toggleFavorite}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Features */}
            <div className="space-y-4 border-t border-gray-200 pt-8">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Truck className="h-5 w-5 text-blue-900" />
                <span>Free shipping on orders over {formatCurrency(50)}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <RotateCcw className="h-5 w-5 text-blue-900" />
                <span>{config.returnWindowDays}-day return policy</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Shield className="h-5 w-5 text-blue-900" />
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start border-b border-gray-200 rounded-none bg-transparent p-0">
            <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-blue-900 data-[state=active]:text-blue-900 text-gray-500">
              Description
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-blue-900 data-[state=active]:text-blue-900 text-gray-500">
              Reviews ({reviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="py-8">
            <p className="text-gray-600 leading-relaxed">{product.description || 'No description available.'}</p>
          </TabsContent>

          <TabsContent value="reviews" className="py-8">
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <p className="text-gray-500 italic">No reviews yet. Be the first to review this product!</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6">
                    <div className="flex items-center space-x-2 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    {review.title && <h4 className="font-semibold mb-2 text-gray-900">{review.title}</h4>}
                    <p className="text-gray-600">{review.comment}</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ProductDetailPage;
