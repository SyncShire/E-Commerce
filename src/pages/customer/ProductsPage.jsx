import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/customSupabaseClient';
import { formatCurrency } from '@/lib/currency';

const PAGE_SIZE = 12;

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    fetchCategories();
    fetchBrands();

    // Initialize gender filter from URL if present
    const genderParam = searchParams.get('gender');
    if (genderParam) {
      setSelectedGenders([genderParam]);
    }
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategories, selectedBrands, selectedGenders, priceRange, sortBy, searchParams]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Build base query
      // Using left join for brands to ensure products without brands still show up
      let query = supabase
          .from('products')
          .select(`
          *,
          categories!inner(id, name, slug),
          brands(name, slug)
        `, { count: 'exact' })
          .eq('status', 'active')
          .gt('stock_quantity', 0); // Hide out-of-stock products

      // Category filter logic
      const categoryParam = searchParams.get('category');

      if (categoryParam) {
        query = query.eq('categories.slug', categoryParam);
      }

      if (selectedCategories.length > 0) {
        query = query.in('category_id', selectedCategories);
      }

      // Brand filter
      if (selectedBrands.length > 0) {
        query = query.in('brand_id', selectedBrands);
      }

      // Gender filter
      if (selectedGenders.length > 0) {
        query = query.in('gender', selectedGenders);
      }

      // Price filter
      query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);

      // Sorting
      switch (sortBy) {
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Pagination
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setProducts(data || []);
      setTotalProducts(count || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [searchParams, selectedCategories, selectedBrands, selectedGenders, priceRange, sortBy, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    setCategories(data || []);
  };

  const fetchBrands = async () => {
    const { data } = await supabase.from('brands').select('*');
    setBrands(data || []);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedGenders([]);
    setPriceRange([0, 10000]);
    setSearchParams({});
    setPage(1);
  };

  const totalPages = Math.ceil(totalProducts / PAGE_SIZE);

  return (
      <>
        <Helmet>
          <title>Shop All Products - ShopVibe</title>
          <meta name="description" content="Browse our complete collection of trendy fashion and lifestyle products." />
        </Helmet>

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gray-900">All Products</h1>
              <p className="text-gray-600">
                Showing {products.length} of {totalProducts} products
              </p>
            </div>

            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Button
                  variant="outline"
                  className="rounded-full md:hidden border-gray-300 text-gray-700"
                  onClick={() => setFilterOpen(!filterOpen)}
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </Button>

              <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-900"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className={`lg:block ${filterOpen ? 'block' : 'hidden'} bg-white p-6 rounded-2xl h-fit sticky top-24 shadow-sm border border-gray-100`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg text-gray-900">Filters</h2>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-blue-900 hover:text-blue-700">
                  Clear All
                </Button>
              </div>

              {/* Gender Filter */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4 text-gray-800">Gender</h3>
                <div className="space-y-3">
                  {['Men', 'Women', 'Unisex'].map((gender) => (
                      <div key={gender} className="flex items-center space-x-2">
                        <Checkbox
                            id={`gender-${gender}`}
                            checked={selectedGenders.includes(gender)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedGenders([...selectedGenders, gender]);
                              } else {
                                setSelectedGenders(selectedGenders.filter(g => g !== gender));
                              }
                            }}
                        />
                        <label
                            htmlFor={`gender-${gender}`}
                            className="text-sm cursor-pointer text-gray-700 hover:text-blue-900"
                        >
                          {gender}
                        </label>
                      </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4 text-gray-800">Price Range</h3>
                <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={10000}
                    step={100}
                    className="mb-4"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{formatCurrency(priceRange[0])}</span>
                  <span>{formatCurrency(priceRange[1])}</span>
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4 text-gray-800">Categories</h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                            id={`category-${category.id}`}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCategories([...selectedCategories, category.id]);
                              } else {
                                setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                              }
                            }}
                        />
                        <label
                            htmlFor={`category-${category.id}`}
                            className="text-sm cursor-pointer text-gray-700 hover:text-blue-900"
                        >
                          {category.name}
                        </label>
                      </div>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4 text-gray-800">Brands</h3>
                <div className="space-y-3">
                  {brands.map((brand) => (
                      <div key={brand.id} className="flex items-center space-x-2">
                        <Checkbox
                            id={`brand-${brand.id}`}
                            checked={selectedBrands.includes(brand.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedBrands([...selectedBrands, brand.id]);
                              } else {
                                setSelectedBrands(selectedBrands.filter(id => id !== brand.id));
                              }
                            }}
                        />
                        <label
                            htmlFor={`brand-${brand.id}`}
                            className="text-sm cursor-pointer text-gray-700 hover:text-blue-900"
                        >
                          {brand.name}
                        </label>
                      </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Updated grid-cols-1 to grid-cols-2 */}
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse border border-gray-100">
                          <div className="aspect-square bg-gray-200"></div>
                          <div className="p-4 space-y-3">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        </div>
                    ))}
                  </div>
              ) : products.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <p className="text-gray-500 text-lg">No products found</p>
                    <Button variant="link" onClick={clearFilters} className="text-blue-900">Clear all filters</Button>
                  </div>
              ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Updated grid-cols-1 to grid-cols-2 */}
                      {products.map((product, index) => (
                          <motion.div
                              key={product.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                          >
                            <Link to={`/products/${product.slug}`}>
                              <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
                                <div className="relative aspect-square overflow-hidden bg-gray-100">
                                  {product.images && product.images[0] ? (
                                      <img
                                          src={product.images[0]}
                                          alt={product.name}
                                          loading="lazy"
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                      />
                                  ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Filter className="h-12 w-12 text-gray-300" />
                                      </div>
                                  )}
                                  {product.compare_price && (
                                      <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                                        Sale
                                      </div>
                                  )}
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                  <h3 className="font-semibold mb-2 line-clamp-2 text-gray-900 group-hover:text-blue-900 transition-colors">{product.name}</h3>
                                  <div className="flex justify-between items-start mb-2">
                                    {product.brands && (
                                        <p className="text-sm text-gray-500">{product.brands.name}</p>
                                    )}
                                    {product.gender && (
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{product.gender}</span>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-blue-900">
                                  {formatCurrency(product.price)}
                                </span>
                                      {product.compare_price && (
                                          <span className="text-sm text-gray-400 line-through">
                                    {formatCurrency(product.compare_price)}
                                  </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-12 space-x-4">
                          <Button
                              variant="outline"
                              disabled={page === 1}
                              onClick={() => setPage(p => Math.max(1, p - 1))}
                              className="rounded-full"
                          >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Previous
                          </Button>
                          <span className="text-sm font-medium text-gray-600">
                      Page {page} of {totalPages}
                    </span>
                          <Button
                              variant="outline"
                              disabled={page === totalPages}
                              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                              className="rounded-full"
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                    )}
                  </>
              )}
            </div>
          </div>
        </div>
      </>
  );
};

export default ProductsPage;