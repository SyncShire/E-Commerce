
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Search, Edit, Trash2, MoreHorizontal, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { formatCurrency, currencyConfig } from '@/lib/currency';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const AdminProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: '',
    brand_id: '',
    status: 'active',
    images: '',
    sizes: '',
    cod_eligible: true,
    featured: false
  });

  // Variant Management
  const [variantStocks, setVariantStocks] = useState({});

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  // Sync variant stocks sum to total stock when sizes exist
  useEffect(() => {
    const sizesArray = formData.sizes ? formData.sizes.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
    if (sizesArray.length > 0) {
      const totalStock = sizesArray.reduce((acc, size) => acc + (parseInt(variantStocks[size] || 0)), 0);
      setFormData(prev => ({ ...prev, stock_quantity: totalStock }));
    }
  }, [variantStocks, formData.sizes]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select(`*, categories(name), brands(name)`)
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ variant: 'destructive', title: 'Error fetching products', description: error.message });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name');
    setCategories(data || []);
  };

  const fetchBrands = async () => {
    const { data } = await supabase.from('brands').select('id, name');
    setBrands(data || []);
  };

  const fetchVariants = async (productId) => {
    const { data } = await supabase.from('product_variants').select('*').eq('product_id', productId);
    return data || [];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleVariantStockChange = (size, value) => {
    setVariantStocks(prev => ({
      ...prev,
      [size]: parseInt(value) || 0
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock_quantity: '',
      category_id: 'none',
      brand_id: 'none',
      status: 'active',
      images: '',
      sizes: '',
      cod_eligible: true,
      featured: false
    });
    setVariantStocks({});
    setEditingProduct(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = async (product) => {
    setEditingProduct(product);
    
    // Fetch variants to populate stocks
    const variants = await fetchVariants(product.id);
    const stockMap = {};
    variants.forEach(v => {
      stockMap[v.name] = v.stock_quantity;
    });

    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock_quantity: product.stock_quantity,
      category_id: product.category_id || 'none',
      brand_id: product.brand_id || 'none',
      status: product.status,
      images: product.images ? product.images.join(', ') : '',
      sizes: product.sizes ? product.sizes.join(', ') : '',
      cod_eligible: product.cod_eligible ?? true,
      featured: product.featured ?? false
    });
    
    setVariantStocks(stockMap);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sizesArray = formData.sizes ? formData.sizes.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
      
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        category_id: formData.category_id === 'none' ? null : formData.category_id,
        brand_id: formData.brand_id === 'none' ? null : formData.brand_id,
        status: formData.status,
        slug: formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        images: formData.images ? formData.images.split(',').map(url => url.trim()).filter(url => url.length > 0) : [],
        sizes: sizesArray,
        cod_eligible: formData.cod_eligible,
        featured: formData.featured
      };

      let productId;

      if (editingProduct) {
        // Update Product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        if (error) throw error;
        productId = editingProduct.id;
        toast({ title: 'Product updated successfully' });
      } else {
        // Create Product
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();
        if (error) throw error;
        productId = data.id;
        toast({ title: 'Product created successfully' });
      }

      // Handle Variants
      // 1. Always delete existing variants first to ensure clean state (e.g. if sizes were removed)
      const { error: deleteError } = await supabase.from('product_variants').delete().eq('product_id', productId);
      if (deleteError) throw deleteError;

      // 2. Create new variants if sizes exist
      if (sizesArray.length > 0) {
        const variantsToInsert = sizesArray.map(size => ({
          product_id: productId,
          name: size,
          stock_quantity: variantStocks[size] || 0,
          price: productData.price, // Assuming same price for now
          sku: `${productData.slug}-${size}` // Simple SKU generation
        }));

        if (variantsToInsert.length > 0) {
          const { error: variantError } = await supabase.from('product_variants').insert(variantsToInsert);
          if (variantError) throw variantError;
        }
      }

      setIsDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({ variant: 'destructive', title: 'Error saving product', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error deleting product', description: error.message });
    } else {
      toast({ title: 'Product deleted successfully' });
      fetchProducts();
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const hasSizes = formData.sizes && formData.sizes.trim().length > 0;
  const parsedSizes = hasSizes ? formData.sizes.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];

  return (
    <>
      <Helmet>
        <title>Products - Admin Panel</title>
      </Helmet>

      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-[#102a43]">Products Management</h1>
          <Button
            onClick={openAddDialog}
            className="rounded-lg bg-[#102a43] hover:bg-[#243b53] text-white shadow-sm"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Product
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="p-4 border-b border-slate-100 flex items-center">
            <Search className="h-5 w-5 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="flex-1 outline-none text-sm text-slate-700 placeholder-slate-400 bg-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#102a43] uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#102a43] uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#102a43] uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#102a43] uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#102a43] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-[#102a43] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-500">Loading products...</td></tr>
                ) : filteredProducts.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-slate-500">No products found.</td></tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 group transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-medium">No Img</div>
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-[#102a43] block">{product.name}</span>
                            <span className="text-xs text-slate-500 truncate max-w-[200px] block">{product.description}</span>
                            <div className="flex gap-1 mt-1">
                              {product.featured && (
                                <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100">Featured</span>
                              )}
                              {!product.cod_eligible && (
                                <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100">No COD</span>
                              )}
                              {product.sizes && product.sizes.length > 0 && (
                                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">Sizes</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {product.categories?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{formatCurrency(product.price)}</td>
                      <td className="px-6 py-4 text-slate-600">{product.stock_quantity}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                          product.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-[#102a43]">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 bg-white border-slate-200 shadow-md">
                            <DropdownMenuItem onClick={() => openEditDialog(product)} className="text-slate-700 focus:text-[#102a43] cursor-pointer hover:bg-slate-100">
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-rose-600 focus:text-rose-700 cursor-pointer hover:bg-rose-50" onClick={() => handleDelete(product.id)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[800px] bg-white text-slate-900 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#102a43] text-xl font-semibold">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription className="text-slate-500">
                Fill in the details below. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name" className="text-[#102a43]">Product Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g. Wireless Headphones" className="bg-slate-50 border-slate-200 text-slate-900 focus:ring-[#102a43] focus:border-[#102a43]" />
                </div>
                
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description" className="text-[#102a43]">Description</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Product description..." className="bg-slate-50 border-slate-200 text-slate-900 focus:ring-[#102a43] focus:border-[#102a43]" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-[#102a43]">Price ({currencyConfig.symbol})</Label>
                  <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} required className="bg-slate-50 border-slate-200 text-slate-900 focus:ring-[#102a43] focus:border-[#102a43]" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-[#102a43]">Category</Label>
                  <Select value={formData.category_id} onValueChange={(val) => handleSelectChange('category_id', val)}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 focus:ring-[#102a43] focus:border-[#102a43]">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                      <SelectItem value="none">None</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-[#102a43]">Brand</Label>
                  <Select value={formData.brand_id} onValueChange={(val) => handleSelectChange('brand_id', val)}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 focus:ring-[#102a43] focus:border-[#102a43]">
                      <SelectValue placeholder="Select Brand" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                      <SelectItem value="none">None</SelectItem>
                      {brands.map(brand => (
                        <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-[#102a43]">Status</Label>
                  <Select value={formData.status} onValueChange={(val) => handleSelectChange('status', val)}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900 focus:ring-[#102a43] focus:border-[#102a43]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="sizes" className="text-[#102a43]">Sizes (Comma separated, e.g., S, M, L, XL)</Label>
                  <Input id="sizes" name="sizes" value={formData.sizes} onChange={handleInputChange} placeholder="e.g. S, M, L, XL" className="bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-[#102a43] focus:border-[#102a43]" />
                </div>

                {/* Dynamic Stock Input */}
                {hasSizes ? (
                  <div className="col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <Label className="text-[#102a43] mb-3 block">Stock Per Size</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {parsedSizes.map(size => (
                        <div key={size} className="space-y-1">
                          <Label htmlFor={`stock-${size}`} className="text-xs text-slate-500">{size}</Label>
                          <Input 
                            id={`stock-${size}`} 
                            type="number" 
                            min="0"
                            value={variantStocks[size] || ''} 
                            onChange={(e) => handleVariantStockChange(size, e.target.value)} 
                            className="h-8 bg-white"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center text-sm text-[#102a43] font-medium border-t border-slate-200 pt-2">
                      <span className="flex-1">Total Stock (Calculated):</span>
                      <span>{formData.stock_quantity}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="stock_quantity" className="text-[#102a43]">Stock Quantity</Label>
                    <Input id="stock_quantity" name="stock_quantity" type="number" value={formData.stock_quantity} onChange={handleInputChange} required className="bg-slate-50 border-slate-200 text-slate-900 focus:ring-[#102a43] focus:border-[#102a43]" />
                  </div>
                )}

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="images" className="text-[#102a43]">Images (Comma separated URLs)</Label>
                  <Textarea id="images" name="images" value={formData.images} onChange={handleInputChange} placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" className="bg-slate-50 border-slate-200 text-slate-900 focus:ring-[#102a43] focus:border-[#102a43] min-h-[100px]" />
                  <p className="text-xs text-slate-500">First image will be used as the main thumbnail.</p>
                </div>

                <div className="col-span-2 flex flex-col sm:flex-row gap-4 pt-2">
                   <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="cod_eligible" 
                      checked={formData.cod_eligible} 
                      onCheckedChange={(checked) => handleCheckboxChange('cod_eligible', checked)} 
                    />
                    <Label htmlFor="cod_eligible" className="text-slate-700 cursor-pointer">Eligible for Cash on Delivery (COD)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="featured" 
                      checked={formData.featured} 
                      onCheckedChange={(checked) => handleCheckboxChange('featured', checked)} 
                    />
                    <Label htmlFor="featured" className="text-slate-700 cursor-pointer">Featured Product</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="text-slate-600 border-slate-300 hover:bg-slate-50">Cancel</Button>
                <Button type="submit" disabled={loading} className="bg-[#102a43] hover:bg-[#243b53] text-white shadow-sm">{loading ? 'Saving...' : 'Save Product'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AdminProducts;
