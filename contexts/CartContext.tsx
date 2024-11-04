import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, ProductStruct } from '@/utils/type.dt';
import { toast } from 'react-toastify';

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (product: Partial<CartItem>) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const items = JSON.parse(savedCart);
      setCartItems(items);
      updateCartCount(items);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    updateCartCount(cartItems);
  }, [cartItems]);

  const updateCartCount = (items: CartItem[]) => {
    const count = items.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
  };

  const addToCart = (product: Partial<CartItem>) => {
    if (!product.id || !product.price) {
      toast.error('Invalid product data');
      return;
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        const newQuantity = (existingItem.quantity || 0) + (product.quantity || 1);
        if (newQuantity > Number(product.stock)) {
          toast.error('Quantity exceeds available stock');
          return prevItems;
        }
        
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      return [...prevItems, { ...product as CartItem, quantity: product.quantity || 1 }];
    });
    
    toast.success('Added to cart');
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    toast.success('Removed from cart');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems => {
      const item = prevItems.find(item => item.id === productId);
      if (!item) return prevItems;

      if (quantity > Number(item.stock)) {
        toast.error('Quantity exceeds available stock');
        return prevItems;
      }

      return prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
    });
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 