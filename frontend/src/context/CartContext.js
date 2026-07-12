"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProductId } from "../lib/productImage";

const CartContext = createContext(undefined);

const STORAGE_KEY = "smart-shopping-cart";

/**
 * Reads the persisted cart from localStorage. Safe to call during the
 * initial render effect only — never during SSR, since `window` doesn't
 * exist there.
 */
function readStoredCart() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("CartContext: failed to read cart from localStorage", error);
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage once, after mount (client only).
  useEffect(() => {
    setItems(readStoredCart());
    setIsHydrated(true);
  }, []);

  // Persist on every change, but only after the initial hydration read has
  // happened — otherwise the empty initial state would overwrite whatever
  // was already saved before hydration finishes.
  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("CartContext: failed to persist cart to localStorage", error);
    }
  }, [items, isHydrated]);

  const addItem = useCallback((product, quantity = 1) => {
    const id = product.id || getProductId(product);

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === id);

      if (existingIndex !== -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }

      return [...prev, { ...product, id, quantity }];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item))
    );
  }, []);

  const incrementQuantity = useCallback(
    (id, delta) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        )
      );
    },
    []
  );

  const clearCart = useCallback(() => setItems([]), []);

  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      isHydrated,
      addItem,
      removeItem,
      updateQuantity,
      incrementQuantity,
      clearCart,
      totalCount,
      totalPrice,
    }),
    [items, isHydrated, addItem, removeItem, updateQuantity, incrementQuantity, clearCart, totalCount, totalPrice]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Access cart state and actions from any client component.
 * Must be called from a component rendered under <CartProvider>.
 */
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a <CartProvider>");
  }
  return context;
}