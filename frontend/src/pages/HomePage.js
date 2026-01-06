import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Leaf, Heart, Award } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // First try to seed products
        await axios.post(`${API}/admin/seed`);
        // Then fetch featured products
        const response = await axios.get(`${API}/products?featured=true&limit=4`);
        setFeaturedProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const whyBeautivra = [
    { icon: Award, title: 'Premium Quality', description: 'Handcrafted from the finest materials' },
    { icon: Sparkles, title: 'Minimal Design', description: 'Beauty in simplicity' },
    { icon: Heart, title: 'Everyday Use', description: 'Built for daily rituals' },
    { icon: Leaf, title: 'Thoughtfully Made', description: 'Sustainable & ethical sourcing' },
  ];

  const instagramImages = [
    'https://images.pexels.com/photos/7208722/pexels-photo-7208722.jpeg',
    'https://images.pexels.com/photos/6621434/pexels-photo-6621434.jpeg',
    'https://images.pexels.com/photos/5928035/pexels-photo-5928035.jpeg',
    'https://images.pexels.com/photos/3785802/pexels-photo-3785802.jpeg',
    'https://images.pexels.com/photos/7796746/pexels-photo-7796746.jpeg',
    'https://images.unsplash.com/photo-1573248303663-37d7a727a4bf',
  ];

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center" data-testid="hero-section">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/7796746/pexels-photo-7796746.jpeg"
            alt="Beauty tools flatlay"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-brand-dark leading-tight">
              Everyday Beauty,{' '}
              <span className="text-brand-gold">Elevated</span>
            </h1>
            <p className="mt-6 font-body text-lg text-brand-dark/70 leading-relaxed">
              Beautivra creates modern self-care tools designed to make your daily routine feel luxurious.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link to="/shop">
                <Button className="btn-primary inline-flex items-center gap-2" data-testid="shop-now-btn">
                  Shop Collection
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" className="btn-secondary" data-testid="learn-more-btn">
                  Our Story
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Brand Intro */}
      <section className="section-padding bg-brand" data-testid="brand-intro">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-2xl md:text-3xl text-brand-dark leading-relaxed"
          >
            "Small rituals. Big glow."
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 font-body text-brand-dark/60"
          >
            Transform your skincare routine into a moment of self-care with our thoughtfully designed beauty tools.
          </motion.p>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-white" data-testid="featured-products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl text-brand-dark">
                Featured Favorites
              </h2>
              <p className="mt-2 font-body text-brand-dark/60">
                Our most-loved essentials
              </p>
            </div>
            <Link 
              to="/shop" 
              className="mt-4 sm:mt-0 font-body text-sm text-brand-dark hover:text-brand-gold transition-colors flex items-center gap-1"
              data-testid="view-all-products"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] bg-brand-secondary mb-4" />
                  <div className="h-4 bg-brand-secondary rounded w-3/4 mb-2" />
                  <div className="h-3 bg-brand-secondary rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {featuredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Beautivra */}
      <section className="section-padding bg-brand-secondary" data-testid="why-beautivra">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl text-brand-dark">
              Why Beautivra
            </h2>
            <p className="mt-2 font-body text-brand-dark/60">
              Designed for your daily routine
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {whyBeautivra.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-brand-gold" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-lg text-brand-dark mb-2">
                  {item.title}
                </h3>
                <p className="font-body text-sm text-brand-dark/60">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lifestyle Banner */}
      <section className="relative h-[60vh] md:h-[80vh]" data-testid="lifestyle-banner">
        <img
          src="https://images.pexels.com/photos/7208722/pexels-photo-7208722.jpeg"
          alt="Woman using face roller"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-dark/30" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl md:text-5xl text-white mb-6">
              Elevate the Everyday
            </h2>
            <Link to="/shop">
              <Button className="bg-white text-brand-dark hover:bg-white/90 px-8 py-3" data-testid="shop-now-banner">
                Shop Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Benefits Strip */}
      <section className="py-8 bg-brand-dark" data-testid="benefits-strip">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {['Free Shipping Over $75', 'Premium Quality', '30-Day Returns', 'Canada-Wide Delivery'].map((benefit) => (
              <p key={benefit} className="font-body text-sm text-white/80">
                {benefit}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Gallery */}
      <section className="section-padding bg-white" data-testid="instagram-gallery">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl text-brand-dark">
              @beautivra
            </h2>
            <p className="mt-2 font-body text-brand-dark/60">
              Share your ritual with us
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
            {instagramImages.map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="aspect-square overflow-hidden image-zoom-container"
              >
                <img
                  src={img}
                  alt={`Instagram ${index + 1}`}
                  className="w-full h-full object-cover image-zoom"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
