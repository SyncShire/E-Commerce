import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Edit, Trash2, MoreHorizontal, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const AdminBrands = () => {
  const { toast } = useToast();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog & Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', logo: '' });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('brands').select('*').order('created_at', { ascending: false });
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      setBrands(data || []);
    }
    setLoading(false);
  };

  const openAddDialog = () => {
    setEditingBrand(null);
    setFormData({ name: '', description: '', logo: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (brand) => {
    setEditingBrand(brand);
    setFormData({ 
      name: brand.name, 
      description: brand.description || '', 
      logo: brand.logo || '' 
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const brandData = {
        name: formData.name,
        description: formData.description,
        logo: formData.logo,
        slug: formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      };

      if (editingBrand) {
        const { error } = await supabase.from('brands').update(brandData).eq('id', editingBrand.id);
        if (error) throw error;
        toast({ title: 'Brand updated successfully' });
      } else {
        const { error } = await supabase.from('brands').insert([brandData]);
        if (error) throw error;
        toast({ title: 'Brand created successfully' });
      }
      setIsDialogOpen(false);
      fetchBrands();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This cannot be undone.')) return;
    const { error } = await supabase.from('brands').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Brand deleted' });
      fetchBrands();
    }
  };

  const filteredBrands = brands.filter(brand => brand.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      <Helmet>
        <title>Brands - Admin Panel</title>
      </Helmet>

      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-[#102a43]">Brand Management</h1>
          <Button
            onClick={openAddDialog}
            className="rounded-lg bg-[#102a43] hover:bg-[#243b53] text-white shadow-sm"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Brand
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6 p-6">
          <div className="flex items-center border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 mb-6 max-w-md focus-within:ring-2 focus-within:ring-[#102a43]/20 focus-within:border-[#102a43]">
             <Search className="h-4 w-4 text-slate-400 mr-2" />
             <input 
                type="text" 
                placeholder="Search brands..." 
                className="flex-1 outline-none text-sm bg-transparent text-slate-900 placeholder-slate-400"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
               <p className="col-span-full text-center py-8 text-slate-500">Loading brands...</p>
            ) : filteredBrands.length === 0 ? (
               <p className="col-span-full text-center py-8 text-slate-500">No brands found.</p>
            ) : (
               filteredBrands.map((brand) => (
                <div key={brand.id} className="bg-white border border-slate-200 rounded-xl p-6 relative group hover:shadow-lg transition-all hover:border-[#102a43]/20">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-14 w-14 rounded-lg bg-slate-50 p-2 flex items-center justify-center border border-slate-100">
                      {brand.logo ? (
                        <img src={brand.logo} alt={brand.name} className="max-w-full max-h-full object-contain" />
                      ) : (
                        <span className="text-xs font-bold text-slate-300">LOGO</span>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#102a43] hover:bg-slate-50">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => openEditDialog(brand)} className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-rose-600 focus:text-rose-700 cursor-pointer" onClick={() => handleDelete(brand.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h3 className="font-bold text-lg mb-1 text-[#102a43]">{brand.name}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2">{brand.description || 'No description available.'}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-white text-slate-900 border border-slate-200 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-[#102a43] font-semibold">{editingBrand ? 'Edit Brand' : 'Add New Brand'}</DialogTitle>
              <DialogDescription className="text-slate-500">
                Manage your brand details here.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#102a43]">Brand Name</Label>
                <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Nike" className="bg-slate-50 border-slate-200 text-slate-900 focus:ring-[#102a43] focus:border-[#102a43]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo" className="text-[#102a43]">Logo URL</Label>
                <Input id="logo" value={formData.logo} onChange={e => setFormData({...formData, logo: e.target.value})} placeholder="https://..." className="bg-slate-50 border-slate-200 text-slate-900 focus:ring-[#102a43] focus:border-[#102a43]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#102a43]">Description</Label>
                <Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Brand description..." className="bg-slate-50 border-slate-200 text-slate-900 focus:ring-[#102a43] focus:border-[#102a43]" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="text-slate-600 border-slate-300 hover:bg-slate-50">Cancel</Button>
                <Button type="submit" disabled={loading} className="bg-[#102a43] hover:bg-[#243b53] text-white shadow-sm">Save Brand</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AdminBrands;