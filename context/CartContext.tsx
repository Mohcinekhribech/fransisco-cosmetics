
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, OrderDetails } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  addToCartWithQuantity: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  lastOrder: OrderDetails | null;
  completeOrder: (details: Omit<OrderDetails, 'id' | 'items' | 'total' | 'date'>) => string;
  /** After API order success: set lastOrder and clear cart (for thank-you page). */
  completeOrderWithApi: (orderId: string, total: number, date: string, formDetails: Omit<OrderDetails, 'id' | 'items' | 'total' | 'date'>) => void;
  toastMessage: string | null;
  dismissToast: () => void;
  cartJustUpdated: boolean;
  cartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastOrder, setLastOrder] = useState<OrderDetails | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cartJustUpdated, setCartJustUpdated] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const openCartDrawer = () => setCartDrawerOpen(true);
  const closeCartDrawer = () => setCartDrawerOpen(false);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setToastMessage('Added to cart');
    setCartJustUpdated(true);
    setCartDrawerOpen(true);
    setTimeout(() => setCartJustUpdated(false), 600);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const addToCartWithQuantity = (product: Product, quantity: number) => {
    if (quantity < 1) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      const newQty = existing ? existing.quantity + quantity : quantity;
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setToastMessage(quantity > 1 ? `${quantity} added to cart` : 'Added to cart');
    setCartJustUpdated(true);
    setCartDrawerOpen(true);
    setTimeout(() => setCartJustUpdated(false), 600);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const dismissToast = () => setToastMessage(null);

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const completeOrder = (details: Omit<OrderDetails, 'id' | 'items' | 'total' | 'date'>): string => {
    const orderId = `EP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newOrder: OrderDetails = {
      ...details,
      id: orderId,
      items: [...cart],
      total: cartTotal,
      date: new Date().toISOString(),
    };
    setLastOrder(newOrder);
    clearCart();
    return orderId;
  };

  const completeOrderWithApi = (
    orderId: string,
    total: number,
    date: string,
    formDetails: Omit<OrderDetails, 'id' | 'items' | 'total' | 'date'>,
  ) => {
    setLastOrder({
      ...formDetails,
      id: orderId,
      items: [...cart],
      total,
      date,
    });
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, addToCartWithQuantity, removeFromCart, updateQuantity, 
      clearCart, cartTotal, cartCount, lastOrder, completeOrder, completeOrderWithApi,
      toastMessage, dismissToast, cartJustUpdated,
      cartDrawerOpen, openCartDrawer, closeCartDrawer
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
