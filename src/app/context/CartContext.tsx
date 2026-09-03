import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabase";

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
const CART_STORAGE_PREFIX = "campustrade-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [storageKey, setStorageKey] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserCart() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userStorageKey = `${CART_STORAGE_PREFIX}:${user.id}`;
      setStorageKey(userStorageKey);
      try {
        const savedItems = localStorage.getItem(userStorageKey);
        setItems(savedItems ? JSON.parse(savedItems) : []);
      } catch {
        setItems([]);
      }
    }

    loadUserCart();
  }, []);

  useEffect(() => {
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

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