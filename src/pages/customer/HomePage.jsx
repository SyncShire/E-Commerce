
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Star, TrendingUp, Zap, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { formatCurrency } from '@/lib/currency';
import { config } from '@/lib/config';

const HomePage = () => {

    const [loading, setLoading] = useState(true);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
  const {
    scrollYProgress
  } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  useEffect(() => {
    fetchProducts();
  }, []);
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

    const fetchProducts = async () => {
        try {
            // Fetch Featured Products
            const { data: featured } = await supabase
                .from('products')
                .select('*')
                .eq('status', 'active')
                .eq('featured', true)
                .limit(4);

            setFeaturedProducts(featured || []);

            // Fetch New Arrivals
            const { data: newProds } = await supabase
                .from('products')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(8);

            setNewArrivals(newProds || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

  const testimonials = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Verified Buyer",
    feedback:
      "Great experience from start to finish. The website is easy to navigate, checkout was smooth, and the product quality exceeded expectations. Highly recommend!",
    image:
      "https://images.unsplash.com/photo-1603771628357-a2b2d72c2ea0?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 2,
    name: "Sophia Martinez",
    role: "Verified Buyer",
    feedback:
      "Such a smooth shopping experience! The site looks amazing, delivery was quick, and everything arrived exactly as expected. Will 100% be back.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 3,
    name: "Daniel Brooks",
    role: "Verified Buyer",
    feedback:
      "Everything was seamless — from browsing to delivery. The product quality is excellent and the overall experience felt premium. I’ll definitely order again.",
    image:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80",
    },
];


  const customerAvatars = [
    "https://images.unsplash.com/photo-1603771628357-a2b2d72c2ea0?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80",
  ];
  // Hardcoded categories to ensure they always show with high quality images and correct slugs
  const displayCategories = [{
    id: 'clothing',
    name: 'Clothing',
    slug: 'clothing',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800'
  }, {
    id: 'shoes',
    name: 'Shoes',
    slug: 'shoes',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'
  }, {
    id: 'accessories',
    name: 'Accessories',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&q=80&w=800'
  }];
  return <>
      <Helmet>
        <title>{config.appName} - Trendy Fashion & Lifestyle Products</title>
        <meta name="description" content={`Discover the latest trends in fashion and lifestyle. Shop affordable, stylish products at ${config.appName}.`} />
      </Helmet>

      {/* Modern Hero Section */}
      <div className="relative min-h-[90vh] flex items-center bg-slate-50 overflow-hidden">
          {/* Animated Background Blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <motion.div animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0]
        }} transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }} className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-purple-200/30 rounded-full blur-3xl mix-blend-multiply filter opacity-70" />
             <motion.div animate={{
          scale: [1, 1.5, 1],
          rotate: [0, -60, 0]
        }} transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }} className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-3xl mix-blend-multiply filter opacity-70" />
             <motion.div animate={{
          scale: [1, 1.3, 1],
          x: [0, 100, 0]
        }} transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear"
        }} className="absolute bottom-0 right-[20%] w-[500px] h-[500px] bg-pink-200/30 rounded-full blur-3xl mix-blend-multiply filter opacity-70" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
             <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-2xl">
                   <motion.div variants={itemVariants} className="inline-block">
                      <span className="bg-white/80 backdrop-blur-sm border border-white/50 text-[#102a43] px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 mb-6 shadow-sm">
                        <Sparkles className="w-4 h-4 text-amber-500" /> New Season Arrivals
                      </span>
                   </motion.div>
                   <motion.h1 variants={itemVariants} className="text-6xl lg:text-7xl font-extrabold leading-tight mb-6 text-slate-900 tracking-tight">
                      Wear Your <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#102a43] via-[#243b53] to-[#486581] animate-gradient-x">
                        Confidence
                      </span>
                   </motion.h1>
                   <motion.p variants={itemVariants} className="text-xl text-slate-600 mb-8 max-w-lg leading-relaxed font-medium">
                      Discover curated collections of trendy fashion and lifestyle products that match your unique vibe.
                   </motion.p>
                   <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
                      <Link to="/products">
                        <Button className="h-14 px-8 rounded-full bg-[#102a43] text-white hover:bg-[#243b53] text-lg shadow-xl shadow-slate-900/20 transition-all hover:scale-105 active:scale-95">
                           Start Shopping <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      </Link>
                      <Link to="/products?category=sale">
                         <Button variant="outline" className="h-14 px-8 rounded-full border-2 border-slate-200 text-slate-900 hover:border-[#102a43] hover:bg-transparent text-lg transition-all bg-white/50 backdrop-blur-sm">
                            View Deals
                         </Button>
                      </Link>
                   </motion.div>
                   
                   <motion.div variants={itemVariants} className="mt-12 flex items-center gap-4 text-sm font-medium text-slate-500">
                      <div className="flex -space-x-3">
                {customerAvatars.map((avatar, i) => (<div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                  <img alt={`User avatar ${i}`} className="w-full h-full object-cover" src={avatar} />
                           </div>))}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                        </div>
                        <span>Trusted by 10k+ shoppers</span>
                      </div>
                   </motion.div>
                </motion.div>

                <motion.div initial={{
            opacity: 0,
            x: 100
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 1,
            type: "spring",
            bounce: 0.3
          }} className="relative hidden lg:block">
                   <motion.div style={{
              y
            }} className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-500/30 transform rotate-[-2deg] border-[10px] border-white max-w-md mx-auto">
                      <img className="w-full h-auto object-cover aspect-[3/4]" alt="Stylish fashion model in urban setting" src={config.heroImage} />
                   </motion.div>
                   
                   {/* Floating cards */}
                   <motion.div animate={{
              y: [0, -20, 0]
            }} transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }} className="absolute top-20 -left-12 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 flex items-center gap-3 z-20 max-w-[200px]">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                         <Sparkles className="w-6 h-6 text-[#102a43]" />
                      </div>
                      <div>
                         <p className="text-xs text-slate-500 font-bold uppercase">New Collection</p>
                         <p className="font-bold text-slate-900 leading-tight">Summer '26 Drops</p>
                      </div>
                   </motion.div>

                   <motion.div animate={{
              y: [0, 20, 0]
            }} transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }} className="absolute bottom-32 -right-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 flex items-center gap-3 z-20">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                         <Zap className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                         <p className="text-xs text-slate-500 font-bold uppercase">Fast Shipping</p>
                         <p className="font-bold text-slate-900 leading-tight">Next Day Delivery</p>
                      </div>
                   </motion.div>
                </motion.div>
             </div>
          </div>
      </div>

      {/* Brands Ticker */}
      <div className="py-8 bg-white border-y border-slate-100 overflow-hidden">
          <div className="container mx-auto px-4">
             <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-40 grayscale transition-all duration-500">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter hover:text-[#102a43] cursor-default transition-colors">VOGUE</h3>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter hover:text-[#102a43] cursor-default transition-colors">FORBES</h3>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter hover:text-[#102a43] cursor-default transition-colors">ELLE</h3>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter hover:text-[#102a43] cursor-default transition-colors">GQ</h3>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter hover:text-[#102a43] cursor-default transition-colors">WIRED</h3>
             </div>
          </div>
      </div>

      {/* Categories Section */}
      <section className="py-24 bg-white relative">
          <div className="container mx-auto px-4">
             <div className="text-center mb-16">
                <motion.span initial={{
            opacity: 0
          }} whileInView={{
            opacity: 1
          }} className="text-[#102a43] font-bold tracking-wider uppercase text-sm mb-3 block">
                  Collections
                </motion.span>
                <motion.h2 initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
                   Shop by Category
                </motion.h2>
                <div className="w-24 h-1.5 bg-[#102a43] mx-auto rounded-full"></div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {displayCategories.map((category, idx) => <motion.div key={category.id} initial={{
            opacity: 0,
            scale: 0.8
          }} whileInView={{
            opacity: 1,
            scale: 1
          }} transition={{
            delay: idx * 0.1,
            type: "spring"
          }} whileHover={{
            y: -10
          }}>
                      <Link to={`/products?category=${category.slug}`} className="block group">
                         <div className="relative aspect-[4/5] md:aspect-[3/4] rounded-2xl overflow-hidden mb-4 shadow-md group-hover:shadow-xl transition-all duration-500">
                            <img src={category.image} alt={category.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-50 transition-opacity" />
                            <div className="absolute bottom-6 left-6 text-white">
                               <p className="font-bold text-3xl mb-2">{category.name}</p>
                               <span className="text-sm font-medium border-b border-white pb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Shop Now</span>
                            </div>
                         </div>
                      </Link>
                   </motion.div>)}
             </div>
          </div>
      </section>

      {/* Featured Drops - Dark Mode Style */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#102a43]/50 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-[#243b53]/50 to-transparent pointer-events-none" />
          
          <div className="container mx-auto px-4 relative z-10">
             <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                   <span className="text-blue-200 font-bold tracking-wider uppercase text-sm mb-2 block flex items-center gap-2">
                     <Zap className="w-4 h-4" /> Exclusive
                   </span>
                   <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Featured Drops</h2>
                </div>
                <Link to="/products">
                   <Button variant="outline" className="border-slate-700 text-white hover:bg-white hover:text-slate-900 rounded-full px-8 h-12 transition-all">
                      View All Products
                   </Button>
                </Link>
             </div>

             {featuredProducts.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {featuredProducts.map((product, idx) => <motion.div key={product.id} initial={{
            opacity: 0,
            y: 40
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: idx * 0.1
          }} className="group">
                        <Link to={`/products/${product.slug}`}>
                            <div className="relative aspect-[4/5] bg-slate-800 rounded-3xl overflow-hidden mb-4 shadow-2xl">
                                {product.images && product.images[0] ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center text-slate-600">No Image</div>}
                                
                                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                                {product.stock_quantity > 0 ? 'In Stock' : 'Sold Out'}
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                                <Button className="w-full bg-white text-slate-900 hover:bg-slate-200 rounded-full font-bold h-12 shadow-lg">
                                    View Details
                                </Button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold text-lg truncate text-slate-100">{product.name}</h3>
                                <div className="flex gap-3 items-center">
                                <span className="text-blue-200 font-bold text-xl">{formatCurrency(product.price)}</span>
                                {product.compare_price && <span className="text-slate-600 line-through text-sm">{formatCurrency(product.compare_price)}</span>}
                                </div>
                            </div>
                        </Link>
                    </motion.div>)}
                </div> : <div className="text-center py-20 bg-slate-800/50 rounded-3xl border border-slate-700">
                    <p className="text-slate-400 text-lg">No featured products available at the moment.</p>
                </div>}
          </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">New Arrivals</h2>
                  <p className="text-slate-500 max-w-2xl mx-auto">
                      Stay ahead of the curve with our latest additions. Fresh styles added weekly.
                  </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {loading ? (
                      [...Array(8)].map((_, i) => <div key={i} className="bg-slate-50 h-80 rounded-2xl animate-pulse"></div>)
                  ) : (
                      newArrivals.map((product) => (
                          <Link key={product.id} to={`/products/${product.slug}`} className="group block">
                              <div className="mb-4 relative rounded-2xl overflow-hidden aspect-square bg-slate-100">
                                  {product.images && product.images[0] && (
                                      <img
                                          src={product.images[0]}
                                          alt={product.name}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      />
                                  )}
                                  <div className="absolute top-3 left-3">
                                      <span className="bg-white/90 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded-md text-slate-900 shadow-sm">NEW</span>
                                  </div>
                              </div>
                              <div>
                                  <h3 className="font-medium text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                                  <p className="text-slate-500 text-sm font-semibold">{formatCurrency(product.price)}</p>
                              </div>
                          </Link>
                      ))
                  )}
              </div>

              <div className="mt-12 text-center">
                  <Link to="/products">
                      <Button variant="outline" className="rounded-full px-8 border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900">
                          View All Products
                      </Button>
                  </Link>
              </div>
          </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50">
          <div className="container mx-auto px-4">
             <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-slate-900 mb-4">Vibe Check</h2>
                <p className="text-slate-600 text-lg">See what our community is saying</p>
             </div>
             
             <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
                     <motion.div
      key={t.id ?? i}
      whileHover={{ y: -8 }}
      className="bg-white p-8 rounded-[2rem] shadow-lg shadow-indigo-100 border border-slate-100"
    >
                       <div className="flex gap-1 mb-6">
                          {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
                       </div>
                       <p className="text-slate-700 mb-8 italic leading-relaxed text-lg">{t.feedback}</p>
                       <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
                          <div className="w-14 h-14 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-md">
                             <img className="w-full h-full object-cover" alt={`Happy customer ${i}`} src={t.image} />
                          </div>
                          <div>
                             <p className="font-bold text-slate-900 text-lg">{t.name}</p>
                             <p className="text-sm text-[#102a43] font-medium">Verified Buyer</p>
                          </div>
                       </div>
                    </motion.div>))}
             </div>
          </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white border-t border-slate-100">
          <div className="container mx-auto px-4">
             <div className="grid md:grid-cols-4 gap-8">
                {[{
            icon: Truck,
            title: "Free Shipping",
            desc: "On all orders over $50"
          }, {
            icon: ShieldCheck,
            title: "Secure Payment",
            desc: "100% protected payments"
          }, {
            icon: RefreshCw,
            title: "30 Day Returns",
            desc: "No questions asked"
          }, {
            icon: Zap,
            title: "Fast Delivery",
            desc: "2-3 business days"
          }].map((item, idx) => <motion.div key={idx} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: idx * 0.1
          }} className="flex flex-col items-center text-center group cursor-default">
                      <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:bg-[#102a43] group-hover:shadow-lg group-hover:shadow-blue-900/20 transition-all duration-300">
                         <item.icon className="w-8 h-8 text-slate-400 group-hover:text-white transition-colors duration-300" />
                      </div>
                      <h3 className="font-bold text-xl mb-2 text-slate-900">{item.title}</h3>
                      <p className="text-slate-500">{item.desc}</p>
                   </motion.div>)}
             </div>
          </div>
      </section>
    </>;
};
export default HomePage;
