import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, X, ArrowRight, Truck } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const FREE_SHIPPING_THRESHOLD = 75;

const CartPage = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, subtotal, itemCount, clearCart } = useCart();
  const [shipping, setShipping] = useState({ subtotal: 0, shipping: 0, tax: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const calculateTotals = async () => {
      if (items.length === 0) {
        setShipping({ subtotal: 0, shipping: 0, tax: 0, total: 0 });
        return;
      }
      
      try {
        const response = await axios.post(`${API}/calculate-shipping`, { items });
        setShipping(response.data);
      } catch (error) {
        console.error('Error calculating shipping:', error);
      }
    };
    calculateTotals();
  }, [items]);

  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-20 md:pt-24" data-testid="cart-page-empty">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="font-heading text-3xl md:text-4xl text-brand-dark mb-4">Your Bag is Empty</h1>
          <p className="font-body text-brand-dark/60 mb-8">Looks like you haven't added any items yet.</p>
          <Link to="/shop">
            <Button className="btn-primary" data-testid="continue-shopping-btn">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24" data-testid="cart-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <h1 className="font-heading text-3xl md:text-4xl text-brand-dark mb-8">Your Bag</h1>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {/* Free shipping progress */}
            {remainingForFreeShipping > 0 && (
              <div className="mb-6 p-4 bg-brand-secondary">
                <div className="flex items-center gap-2 mb-2">
                  <Truck size={18} className="text-brand-dark" />
                  <p className="font-body text-sm text-brand-dark">
                    Add <span className="font-medium">${remainingForFreeShipping.toFixed(2)}</span> more for free shipping
                  </p>
                </div>
                <div className="h-1 bg-brand-dark/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-gold transition-all duration-500"
                    style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {remainingForFreeShipping <= 0 && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200">
                <div className="flex items-center gap-2">
                  <Truck size={18} className="text-green-600" />
                  <p className="font-body text-sm text-green-700">You've unlocked free shipping!</p>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="space-y-6">
              {items.map((item, index) => (
                <motion.div
                  key={`${item.product_id}-${item.variant}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 md:gap-6 pb-6 border-b border-brand-dark/10"
                  data-testid={`cart-item-${index}`}
                >
                  <Link to={`/product/${item.product_id}`} className="w-24 md:w-32 aspect-square bg-brand-secondary flex-shrink-0 overflow-hidden">
                    <img
                      src={item.product_image || 'https://images.pexels.com/photos/5928035/pexels-photo-5928035.jpeg'}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link to={`/product/${item.product_id}`}>
                          <h3 className="font-heading text-lg text-brand-dark hover:text-brand-gold transition-colors">
                            {item.product_name}
                          </h3>
                        </Link>
                        {item.variant && (
                          <p className="font-body text-sm text-brand-dark/50 mt-1">
                            {item.variant}
                          </p>
                        )}
                        <p className="font-body text-sm font-medium text-brand-dark mt-2">
                          ${item.price.toFixed(2)} CAD
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product_id, item.variant)}
                        className="text-brand-dark/40 hover:text-brand-dark transition-colors"
                        data-testid={`remove-item-${index}`}
                      >
                        <X size={20} />
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center border border-brand-dark/20">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.variant, item.quantity - 1)}
                          className="p-2 hover:bg-brand-secondary transition-colors"
                          data-testid={`decrease-qty-${index}`}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-4 font-body text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.variant, item.quantity + 1)}
                          className="p-2 hover:bg-brand-secondary transition-colors"
                          data-testid={`increase-qty-${index}`}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <span className="font-body font-medium text-brand-dark">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-brand-secondary p-6 sticky top-28">
              <h2 className="font-heading text-xl text-brand-dark mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-brand-dark/60">Subtotal ({itemCount} items)</span>
                  <span className="text-brand-dark">${shipping.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-brand-dark/60">Shipping</span>
                  <span className="text-brand-dark">
                    {shipping.shipping === 0 ? 'Free' : `$${shipping.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-brand-dark/60">HST (13%)</span>
                  <span className="text-brand-dark">${shipping.tax.toFixed(2)}</span>
                </div>
                
                <div className="pt-4 border-t border-brand-dark/10">
                  <div className="flex justify-between">
                    <span className="font-body font-medium text-brand-dark">Total</span>
                    <span className="font-body text-xl font-medium text-brand-dark">
                      ${shipping.total.toFixed(2)} CAD
                    </span>
                  </div>
                </div>
              </div>

              <Link to="/checkout" className="block mt-6">
                <Button className="w-full btn-primary flex items-center justify-center gap-2" data-testid="checkout-btn">
                  Proceed to Checkout
                  <ArrowRight size={18} />
                </Button>
              </Link>

              <Link to="/shop" className="block mt-4">
                <Button variant="ghost" className="w-full font-body text-sm text-brand-dark/60 hover:text-brand-dark">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
