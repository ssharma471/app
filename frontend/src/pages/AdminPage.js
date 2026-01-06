import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Loader2, Upload, Check } from 'lucide-react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = [
  { id: 'ice-rollers', name: 'Ice Rollers' },
  { id: 'scalp-massagers', name: 'Scalp Massagers' },
  { id: 'gua-sha', name: 'Gua Sha Tools' },
  { id: 'face-rollers', name: 'Face Rollers' },
  { id: 'hair-oil-applicators', name: 'Hair Oil Applicators' },
  { id: 'under-eye-tools', name: 'Under Eye Tools' },
  { id: 'cleansing-brushes', name: 'Cleansing Brushes' },
  { id: 'beauty-organizers', name: 'Beauty Organizers' },
];

const emptyProduct = {
  name: '',
  slug: '',
  description: '',
  short_description: '',
  price: '',
  compare_at_price: '',
  category: 'gua-sha',
  images: [{ url: '', alt: '', is_primary: true }],
  variants: [],
  benefits: [''],
  how_to_use: '',
  why_love_it: [''],
  in_stock: true,
  featured: false,
  meta_title: '',
  meta_description: ''
};

const AdminPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'name') {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (index, field, value) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages[index] = { ...newImages[index], [field]: value };
      return { ...prev, images: newImages };
    });
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: '', alt: '', is_primary: false }]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { name: 'Color', value: '', price_modifier: 0 }]
    }));
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleVariantChange = (index, field, value) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      newVariants[index] = { ...newVariants[index], [field]: field === 'price_modifier' ? parseFloat(value) || 0 : value };
      return { ...prev, variants: newVariants };
    });
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData(emptyProduct);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      ...product,
      price: product.price.toString(),
      compare_at_price: product.compare_at_price?.toString() || '',
      benefits: product.benefits?.length ? product.benefits : [''],
      why_love_it: product.why_love_it?.length ? product.why_love_it : [''],
      images: product.images?.length ? product.images : [{ url: '', alt: '', is_primary: true }],
      variants: product.variants || []
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
      benefits: formData.benefits.filter(b => b.trim()),
      why_love_it: formData.why_love_it.filter(w => w.trim()),
      images: formData.images.filter(img => img.url.trim())
    };

    try {
      if (editingProduct) {
        await axios.put(`${API}/admin/products/${editingProduct.id}`, payload);
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${API}/admin/products`, payload);
        toast.success('Product created successfully');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await axios.delete(`${API}/admin/products/${productId}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-brand" data-testid="admin-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-heading text-3xl text-brand-dark">Product Management</h1>
          <Button onClick={openCreateModal} className="btn-primary flex items-center gap-2" data-testid="add-product-btn">
            <Plus size={18} />
            Add Product
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-dark/50" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white border border-brand-dark/10">
            <p className="font-body text-brand-dark/60 mb-4">No products yet</p>
            <Button onClick={openCreateModal} className="btn-secondary" data-testid="add-first-product-btn">
              Add your first product
            </Button>
          </div>
        ) : (
          <div className="bg-white border border-brand-dark/10 overflow-hidden">
            <table className="w-full">
              <thead className="bg-brand-secondary">
                <tr>
                  <th className="text-left px-4 py-3 font-body text-sm font-medium text-brand-dark">Product</th>
                  <th className="text-left px-4 py-3 font-body text-sm font-medium text-brand-dark hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-body text-sm font-medium text-brand-dark">Price</th>
                  <th className="text-left px-4 py-3 font-body text-sm font-medium text-brand-dark hidden md:table-cell">Status</th>
                  <th className="text-right px-4 py-3 font-body text-sm font-medium text-brand-dark">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/10">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-brand-secondary/50" data-testid={`product-row-${product.slug}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-brand-secondary flex-shrink-0">
                          {product.images?.[0]?.url && (
                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-body text-sm font-medium text-brand-dark">{product.name}</p>
                          <p className="font-body text-xs text-brand-dark/50">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-brand-dark/70 hidden md:table-cell">
                      {CATEGORIES.find(c => c.id === product.category)?.name || product.category}
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-brand-dark">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        {product.in_stock ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1">
                            <Check size={12} /> In Stock
                          </span>
                        ) : (
                          <span className="text-xs text-red-700 bg-red-100 px-2 py-1">Out of Stock</span>
                        )}
                        {product.featured && (
                          <span className="text-xs text-brand-gold bg-brand-gold/10 px-2 py-1">Featured</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-brand-dark/60 hover:text-brand-dark transition-colors"
                          data-testid={`edit-${product.slug}`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-500/60 hover:text-red-500 transition-colors"
                          data-testid={`delete-${product.slug}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4" data-testid="product-form">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="font-body text-sm">Product Name *</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1"
                  data-testid="product-name-input"
                />
              </div>
              <div>
                <Label className="font-body text-sm">URL Slug *</Label>
                <Input
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  className="mt-1"
                  data-testid="product-slug-input"
                />
              </div>
            </div>

            <div>
              <Label className="font-body text-sm">Short Description *</Label>
              <Input
                name="short_description"
                value={formData.short_description}
                onChange={handleChange}
                required
                className="mt-1"
                placeholder="Brief product tagline"
                data-testid="product-short-desc-input"
              />
            </div>

            <div>
              <Label className="font-body text-sm">Full Description *</Label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="mt-1 min-h-[100px]"
                data-testid="product-desc-input"
              />
            </div>

            {/* Price & Category */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="font-body text-sm">Price (CAD) *</Label>
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="mt-1"
                  data-testid="product-price-input"
                />
              </div>
              <div>
                <Label className="font-body text-sm">Compare at Price</Label>
                <Input
                  name="compare_at_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.compare_at_price}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="Original price"
                  data-testid="product-compare-price-input"
                />
              </div>
              <div>
                <Label className="font-body text-sm">Category *</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}>
                  <SelectTrigger className="mt-1" data-testid="product-category-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Images */}
            <div>
              <Label className="font-body text-sm mb-2 block">Product Images</Label>
              {formData.images.map((img, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={img.url}
                    onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                    placeholder="Image URL"
                    className="flex-1"
                    data-testid={`product-image-url-${index}`}
                  />
                  <Input
                    value={img.alt}
                    onChange={(e) => handleImageChange(index, 'alt', e.target.value)}
                    placeholder="Alt text"
                    className="w-32"
                  />
                  {formData.images.length > 1 && (
                    <button type="button" onClick={() => removeImage(index)} className="p-2 text-red-500">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addImage} className="text-sm text-brand-dark/60 hover:text-brand-dark">
                + Add image
              </button>
            </div>

            {/* Variants */}
            <div>
              <Label className="font-body text-sm mb-2 block">Product Variants</Label>
              {formData.variants.map((variant, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={variant.name}
                    onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                    placeholder="Type (e.g., Color)"
                    className="w-28"
                  />
                  <Input
                    value={variant.value}
                    onChange={(e) => handleVariantChange(index, 'value', e.target.value)}
                    placeholder="Value (e.g., Rose)"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    value={variant.price_modifier}
                    onChange={(e) => handleVariantChange(index, 'price_modifier', e.target.value)}
                    placeholder="+$"
                    className="w-20"
                  />
                  <button type="button" onClick={() => removeVariant(index)} className="p-2 text-red-500">
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addVariant} className="text-sm text-brand-dark/60 hover:text-brand-dark">
                + Add variant
              </button>
            </div>

            {/* Benefits */}
            <div>
              <Label className="font-body text-sm mb-2 block">Benefits</Label>
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={benefit}
                    onChange={(e) => handleArrayChange('benefits', index, e.target.value)}
                    placeholder="Benefit"
                    className="flex-1"
                    data-testid={`product-benefit-${index}`}
                  />
                  {formData.benefits.length > 1 && (
                    <button type="button" onClick={() => removeArrayItem('benefits', index)} className="p-2 text-red-500">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem('benefits')} className="text-sm text-brand-dark/60 hover:text-brand-dark">
                + Add benefit
              </button>
            </div>

            {/* How to Use */}
            <div>
              <Label className="font-body text-sm">How to Use</Label>
              <Textarea
                name="how_to_use"
                value={formData.how_to_use}
                onChange={handleChange}
                className="mt-1"
                data-testid="product-how-to-use-input"
              />
            </div>

            {/* Status */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="in_stock"
                  checked={formData.in_stock}
                  onChange={handleChange}
                  className="w-4 h-4"
                  data-testid="product-in-stock-checkbox"
                />
                <span className="font-body text-sm">In Stock</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4"
                  data-testid="product-featured-checkbox"
                />
                <span className="font-body text-sm">Featured</span>
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 btn-primary" disabled={saving} data-testid="save-product-btn">
                {saving ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
