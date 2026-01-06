import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('beautivra-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart:', e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('beautivra-cart', JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, variant = null, quantity = 1) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.product_id === product.id && item.variant === variant
      );

      if (existingIndex > -1) {
        const newItems = [...prev];
        newItems[existingIndex].quantity += quantity;
        return newItems;
      }

      const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
      const variantObj = variant ? product.variants?.find(v => v.value === variant) : null;
      const priceModifier = variantObj?.price_modifier || 0;

      return [...prev, {
        product_id: product.id,
        product_name: product.name,
        product_image: primaryImage?.url || '',
        variant: variant,
        price: product.price + priceModifier,
        quantity: quantity
      }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId, variant = null) => {
    setItems(prev => prev.filter(
      item => !(item.product_id === productId && item.variant === variant)
    ));
  }, []);

  const updateQuantity = useCallback((productId, variant, quantity) => {
    if (quantity <= 0) {
      removeItem(productId, variant);
      return;
    }

    setItems(prev => prev.map(item => {
      if (item.product_id === productId && item.variant === variant) {
        return { ...item, quantity };
      }
      return item;
    }));
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      isOpen,
      setIsOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};
