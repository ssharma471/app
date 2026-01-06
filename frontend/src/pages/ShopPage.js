import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const categoryFilter = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || 'featured';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`${API}/products`, {
            params: { category: categoryFilter || undefined }
          }),
          axios.get(`${API}/categories`)
        ]);
        
        let sortedProducts = [...productsRes.data];
        
        if (sortBy === 'price-low') {
          sortedProducts.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-high') {
          sortedProducts.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'newest') {
          sortedProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else {
          // Featured first
          sortedProducts.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        }
        
        setProducts(sortedProducts);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryFilter, sortBy]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = categoryFilter || sortBy !== 'featured';

  return (
    <div className="min-h-screen pt-20 md:pt-24" data-testid="shop-page">
      {/* Page Header */}
      <section className="bg-brand-secondary py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl md:text-5xl text-brand-dark">
            Shop All
          </h1>
          <p className="mt-3 font-body text-brand-dark/60">
            Premium self-care tools for your daily ritual
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          {/* Mobile filter button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden flex items-center gap-2 text-brand-dark font-body text-sm"
            data-testid="mobile-filter-btn"
          >
            <Filter size={18} />
            Filters
          </button>

          {/* Desktop filters */}
          <div className="hidden md:flex items-center gap-4">
            <span className="font-body text-sm text-brand-dark/60">Category:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilter('category', '')}
                className={`px-4 py-2 font-body text-sm transition-colors ${
                  !categoryFilter 
                    ? 'bg-brand-dark text-white' 
                    : 'bg-brand-secondary text-brand-dark hover:bg-brand-dark/10'
                }`}
                data-testid="filter-all"
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateFilter('category', cat.slug)}
                  className={`px-4 py-2 font-body text-sm transition-colors ${
                    categoryFilter === cat.slug
                      ? 'bg-brand-dark text-white'
                      : 'bg-brand-secondary text-brand-dark hover:bg-brand-dark/10'
                  }`}
                  data-testid={`filter-${cat.slug}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <span className="font-body text-sm text-brand-dark/60">Sort:</span>
            <Select value={sortBy} onValueChange={(val) => updateFilter('sort', val)}>
              <SelectTrigger className="w-40 font-body text-sm" data-testid="sort-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active filters */}
        {hasFilters && (
          <div className="flex items-center gap-2 mb-6">
            {categoryFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-secondary text-brand-dark font-body text-sm">
                {categories.find(c => c.slug === categoryFilter)?.name || categoryFilter}
                <button onClick={() => updateFilter('category', '')} className="ml-1">
                  <X size={14} />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="font-body text-sm text-brand-dark/60 hover:text-brand-dark underline"
              data-testid="clear-filters"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-brand-secondary mb-4" />
                <div className="h-4 bg-brand-secondary rounded w-3/4 mb-2" />
                <div className="h-3 bg-brand-secondary rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-body text-brand-dark/60 mb-4">No products found</p>
            <Button onClick={clearFilters} className="btn-secondary" data-testid="clear-filters-btn">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}

        {/* Results count */}
        {!loading && products.length > 0 && (
          <p className="mt-8 text-center font-body text-sm text-brand-dark/50">
            Showing {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Mobile Filters Overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden" data-testid="mobile-filters">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="absolute left-0 top-0 bottom-0 w-80 bg-white p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-xl">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-body text-sm font-medium mb-3">Category</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => { updateFilter('category', ''); setMobileFiltersOpen(false); }}
                    className={`block w-full text-left px-4 py-2 font-body text-sm ${
                      !categoryFilter ? 'bg-brand-secondary' : ''
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { updateFilter('category', cat.slug); setMobileFiltersOpen(false); }}
                      className={`block w-full text-left px-4 py-2 font-body text-sm ${
                        categoryFilter === cat.slug ? 'bg-brand-secondary' : ''
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
