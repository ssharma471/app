import { Link } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

const FREE_SHIPPING_THRESHOLD = 75;

const CartDrawer = () => {
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div className="flex flex-col h-full bg-white" data-testid="cart-drawer">
      <SheetHeader className="px-6 py-4 border-b">
        <SheetTitle className="font-heading text-xl flex items-center gap-2">
          <ShoppingBag size={20} />
          Your Bag ({itemCount})
        </SheetTitle>
      </SheetHeader>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <ShoppingBag size={48} className="text-brand-dark/20 mb-4" />
          <p className="font-body text-brand-dark/60 mb-6">Your bag is empty</p>
          <Link to="/shop">
            <Button className="btn-primary" data-testid="continue-shopping-btn">
              Continue Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Free shipping progress */}
          {remainingForFreeShipping > 0 && (
            <div className="px-6 py-4 bg-brand-secondary">
              <p className="font-body text-sm text-brand-dark/80 text-center">
                Add <span className="font-medium">${remainingForFreeShipping.toFixed(2)}</span> more for free shipping
              </p>
              <div className="mt-2 h-1 bg-brand-dark/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-gold transition-all duration-500"
                  style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {items.map((item, index) => (
                <div 
                  key={`${item.product_id}-${item.variant}`}
                  className="flex gap-4"
                  data-testid={`cart-item-${index}`}
                >
                  <div className="w-20 h-24 bg-brand-secondary overflow-hidden flex-shrink-0">
                    <img
                      src={item.product_image || 'https://images.pexels.com/photos/5928035/pexels-photo-5928035.jpeg'}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-body text-sm font-medium text-brand-dark truncate">
                          {item.product_name}
                        </h4>
                        {item.variant && (
                          <p className="font-body text-xs text-brand-dark/50 mt-0.5">
                            {item.variant}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.product_id, item.variant)}
                        className="text-brand-dark/40 hover:text-brand-dark transition-colors"
                        data-testid={`remove-item-${index}`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center border border-brand-dark/20">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.variant, item.quantity - 1)}
                          className="p-1.5 hover:bg-brand-secondary transition-colors"
                          data-testid={`decrease-qty-${index}`}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 font-body text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.variant, item.quantity + 1)}
                          className="p-1.5 hover:bg-brand-secondary transition-colors"
                          data-testid={`increase-qty-${index}`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="font-body text-sm font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-body text-sm text-brand-dark/60">Subtotal</span>
              <span className="font-body text-lg font-medium">${subtotal.toFixed(2)} CAD</span>
            </div>
            <p className="font-body text-xs text-brand-dark/50 text-center">
              Shipping & taxes calculated at checkout
            </p>
            <Link to="/cart" className="block">
              <Button className="w-full btn-primary flex items-center justify-center gap-2" data-testid="view-cart-btn">
                View Bag & Checkout
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default CartDrawer;
