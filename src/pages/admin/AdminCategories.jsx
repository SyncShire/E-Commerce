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

const AdminCategories = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog & Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', image: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  const openAddDialog = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', image: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category) => {
    setEditingCategory(category);
    setFormData({ 
      name: category.name, 
      description: category.description || '', 
      image: category.image || '' 
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const categoryData = {
        name: formData.name,
        description: formData.description,
        image: formData.image,
        slug: formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      };

      if (editingCategory) {
        const { error } = await supabase.from('categories').update(categoryData).eq('id', editingCategory.id);
        if (error) throw error;
        toast({ title: 'Category updated successfully' });
      } else {
        const { error } = await supabase.from('categories').insert([categoryData]);
        if (error) throw error;
        toast({ title: 'Category created successfully' });
      }
      setIsDialogOpen(false);
      fetchCategories();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This cannot be undone.')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Category deleted' });
      fetchCategories();
    }
  };

  const filteredCategories = categories.filter(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      <Helmet>
        <title>Categories - Admin Panel</title>
      </Helmet>

      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold">Categories</h1>
          <Button
            onClick={openAddDialog}
            className="rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Category
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6 p-4">
          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 mb-6 max-w-md">
             <Search className="h-4 w-4 text-gray-400 mr-2" />
             <input 
                type="text" 
                placeholder="Search categories..." 
                className="flex-1 outline-none text-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
               <p className="col-span-full text-center py-8 text-gray-500">Loading categories...</p>
            ) : filteredCategories.length === 0 ? (
               <p className="col-span-full text-center py-8 text-gray-500">No categories found.</p>
            ) : (
               filteredCategories.map((category) => (
                <div key={category.id} className="bg-gray-50 rounded-xl p-6 relative group hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 rounded-lg bg-white p-2 flex items-center justify-center border border-gray-200 overflow-hidden">
                      {category.image ? (
                        <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-gray-300">IMG</span>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(category)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(category.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{category.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{category.description || 'No description available.'}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-white text-gray-900"> {/* Added bg-white text-gray-900 */}
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
              <DialogDescription className="text-gray-600"> {/* Ensured description text is visible */}
                Manage your category details here.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Electronics" className="bg-white text-gray-900 border-gray-300"/> {/* Explicit styling */}
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input id="image" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." className="bg-white text-gray-900 border-gray-300"/> {/* Explicit styling */}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Category description..." className="bg-white text-gray-900 border-gray-300"/> {/* Explicit styling */}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">Save Category</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AdminCategories;