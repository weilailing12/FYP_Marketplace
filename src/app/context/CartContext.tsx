import { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  sellerId?: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  isInCart: (id: string) => boolean;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const CART_STORAGE_KEY = "campustrade-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const savedItems = localStorage.getItem(CART_STORAGE_KEY);
      return savedItems ? JSON.parse(savedItems) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => ({
    items,
    addItem: (item: CartItem) => setItems((current) => (
      current.some((existing) => existing.id === item.id) ? current : [...current, item]
    )),
    removeItem: (id: string) => setItems((current) => current.filter((item) => item.id !== id)),
    isInCart: (id: string) => items.some((item) => item.id === id),
    itemCount: items.length,
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}