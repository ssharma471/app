import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProductCard = ({ product, index = 0 }) => {
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
      data-testid={`product-card-${product.slug}`}
    >
      <Link to={`/product/${product.slug}`} className="block">
        {/* Image Container */}
        <div className="aspect-[4/5] overflow-hidden bg-brand-secondary mb-4">
          <img
            src={primaryImage?.url || 'https://images.pexels.com/photos/5928035/pexels-photo-5928035.jpeg'}
            alt={primaryImage?.alt || product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-1">
          <h3 className="font-heading text-lg text-brand-dark group-hover:text-brand-gold transition-colors duration-300">
            {product.name}
          </h3>
          
          <p className="font-body text-sm text-brand-dark/60 line-clamp-1">
            {product.short_description}
          </p>
          
          <div className="flex items-center gap-2 pt-1">
            <span className="font-body text-sm font-medium text-brand-dark">
              ${product.price.toFixed(2)} CAD
            </span>
            {hasDiscount && (
              <span className="font-body text-sm text-brand-dark/40 line-through">
                ${product.compare_at_price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
