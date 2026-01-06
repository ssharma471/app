import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, ChevronRight, Star, Check, Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProductPage = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const productRes = await axios.get(`${API}/products/${slug}`);
        setProduct(productRes.data);
        
        // Set default variant
        if (productRes.data.variants?.length > 0) {
          setSelectedVariant(productRes.data.variants[0].value);
        }
        
        // Fetch reviews
        const reviewsRes = await axios.get(`${API}/reviews/${productRes.data.id}`);
        setReviews(reviewsRes.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, selectedVariant, quantity);
      toast.success(`${product.name} added to your bag`);
    }
  };

  const getCurrentPrice = () => {
    if (!product) return 0;
    const variantObj = selectedVariant 
      ? product.variants?.find(v => v.value === selectedVariant) 
      : null;
    return product.price + (variantObj?.price_modifier || 0);
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="aspect-[4/5] bg-brand-secondary animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-brand-secondary rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-brand-secondary rounded w-1/2 animate-pulse" />
              <div className="h-6 bg-brand-secondary rounded w-1/4 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-brand-dark mb-4">Product not found</h1>
          <Link to="/shop">
            <Button className="btn-primary">Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const variantGroups = product.variants?.reduce((acc, v) => {
    if (!acc[v.name]) acc[v.name] = [];
    acc[v.name].push(v);
    return acc;
  }, {}) || {};

  return (
    <div className="min-h-screen pt-20 md:pt-24" data-testid="product-page">
      {/* Breadcrumb */}
      <div className="bg-brand-secondary py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 font-body text-sm text-brand-dark/60">
            <Link to="/" className="hover:text-brand-dark">Home</Link>
            <ChevronRight size={14} />
            <Link to="/shop" className="hover:text-brand-dark">Shop</Link>
            <ChevronRight size={14} />
            <span className="text-brand-dark">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
          {/* Images */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-[4/5] bg-brand-secondary overflow-hidden"
            >
              <img
                src={product.images?.[selectedImage]?.url || 'https://images.pexels.com/photos/5928035/pexels-photo-5928035.jpeg'}
                alt={product.images?.[selectedImage]?.alt || product.name}
                className="w-full h-full object-cover"
                data-testid="product-main-image"
              />
            </motion.div>
            
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-brand-dark' : 'border-transparent'
                    }`}
                    data-testid={`product-thumbnail-${index}`}
                  >
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="md:sticky md:top-28 md:self-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="font-heading text-3xl md:text-4xl text-brand-dark" data-testid="product-name">
                {product.name}
              </h1>
              
              {/* Rating */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < Math.round(averageRating) ? 'fill-brand-gold text-brand-gold' : 'text-brand-dark/20'}
                      />
                    ))}
                  </div>
                  <span className="font-body text-sm text-brand-dark/60">
                    ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                  </span>
                </div>
              )}

              <p className="mt-4 font-body text-brand-dark/70" data-testid="product-description">
                {product.short_description}
              </p>

              {/* Price */}
              <div className="mt-6 flex items-center gap-3">
                <span className="font-body text-2xl font-medium text-brand-dark" data-testid="product-price">
                  ${getCurrentPrice().toFixed(2)} CAD
                </span>
                {product.compare_at_price && (
                  <span className="font-body text-lg text-brand-dark/40 line-through">
                    ${product.compare_at_price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Variants */}
              {Object.entries(variantGroups).map(([name, variants]) => (
                <div key={name} className="mt-6">
                  <label className="font-body text-sm font-medium text-brand-dark block mb-3">
                    {name}: <span className="font-normal text-brand-dark/60">{selectedVariant}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((variant) => (
                      <button
                        key={variant.value}
                        onClick={() => setSelectedVariant(variant.value)}
                        className={`px-4 py-2 font-body text-sm border transition-all ${
                          selectedVariant === variant.value
                            ? 'border-brand-dark bg-brand-dark text-white'
                            : 'border-brand-dark/20 hover:border-brand-dark'
                        }`}
                        data-testid={`variant-${variant.value.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {variant.value}
                        {variant.price_modifier > 0 && ` (+$${variant.price_modifier})`}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Quantity */}
              <div className="mt-6">
                <label className="font-body text-sm font-medium text-brand-dark block mb-3">
                  Quantity
                </label>
                <div className="inline-flex items-center border border-brand-dark/20">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-brand-secondary transition-colors"
                    data-testid="decrease-quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-6 font-body" data-testid="quantity-value">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-brand-secondary transition-colors"
                    data-testid="increase-quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Add to cart */}
              <div className="mt-8 space-y-3">
                <Button 
                  onClick={handleAddToCart}
                  className="w-full btn-primary"
                  disabled={!product.in_stock}
                  data-testid="add-to-cart-btn"
                >
                  {product.in_stock ? 'Add to Bag' : 'Out of Stock'}
                </Button>
              </div>

              {/* Benefits */}
              <div className="mt-8 pt-8 border-t border-brand-dark/10 space-y-4">
                <div className="flex items-center gap-3 text-brand-dark/70">
                  <Truck size={18} />
                  <span className="font-body text-sm">Free shipping on orders over $75 CAD</span>
                </div>
                <div className="flex items-center gap-3 text-brand-dark/70">
                  <RotateCcw size={18} />
                  <span className="font-body text-sm">30-day returns</span>
                </div>
                <div className="flex items-center gap-3 text-brand-dark/70">
                  <ShieldCheck size={18} />
                  <span className="font-body text-sm">1 year warranty</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16 md:mt-24">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 space-x-8">
              <TabsTrigger 
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-dark data-[state=active]:bg-transparent px-0 pb-4 font-body"
                data-testid="tab-description"
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="how-to-use"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-dark data-[state=active]:bg-transparent px-0 pb-4 font-body"
                data-testid="tab-how-to-use"
              >
                How to Use
              </TabsTrigger>
              <TabsTrigger 
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-dark data-[state=active]:bg-transparent px-0 pb-4 font-body"
                data-testid="tab-reviews"
              >
                Reviews ({reviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-8">
              <div className="max-w-3xl">
                <p className="font-body text-brand-dark/70 leading-relaxed">
                  {product.description}
                </p>
                
                {product.benefits?.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-heading text-xl text-brand-dark mb-4">Benefits</h3>
                    <ul className="space-y-2">
                      {product.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-3 font-body text-brand-dark/70">
                          <Check size={16} className="text-brand-gold flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {product.why_love_it?.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-heading text-xl text-brand-dark mb-4">Why You'll Love It</h3>
                    <ul className="space-y-2">
                      {product.why_love_it.map((reason, index) => (
                        <li key={index} className="flex items-center gap-3 font-body text-brand-dark/70">
                          <Check size={16} className="text-brand-gold flex-shrink-0" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="how-to-use" className="mt-8">
              <div className="max-w-3xl">
                <p className="font-body text-brand-dark/70 leading-relaxed">
                  {product.how_to_use || 'Instructions coming soon.'}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-8">
              <div className="max-w-3xl">
                {reviews.length === 0 ? (
                  <p className="font-body text-brand-dark/60">No reviews yet. Be the first to review this product!</p>
                ) : (
                  <div className="space-y-8">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-brand-dark/10 pb-8">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < review.rating ? 'fill-brand-gold text-brand-gold' : 'text-brand-dark/20'}
                              />
                            ))}
                          </div>
                          {review.verified_purchase && (
                            <span className="text-xs font-body text-brand-gold">Verified Purchase</span>
                          )}
                        </div>
                        <h4 className="font-body font-medium text-brand-dark">{review.title}</h4>
                        <p className="mt-2 font-body text-sm text-brand-dark/70">{review.content}</p>
                        <p className="mt-3 font-body text-xs text-brand-dark/50">
                          {review.author_name} • {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
