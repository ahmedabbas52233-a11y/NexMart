"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItemWithProduct } from "@/types";

interface CartState {
  items: CartItemWithProduct[];
  isLoading: boolean;
  isOpen: boolean;

  setItems: (items: CartItemWithProduct[]) => void;
  addItem: (item: CartItemWithProduct) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setLoading: (loading: boolean) => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;

  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      isOpen: false,

      setItems: (items) => set({ items }),

      addItem: (item) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.productId === item.productId
          );

          if (existingIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + item.quantity,
            };
            return { items: newItems };
          }

          return { items: [...state.items, item] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((item) => item.productId !== productId)
            : state.items.map((item) =>
                item.productId === productId ? { ...item, quantity } : item
              ),
        })),

      clearCart: () => set({ items: [] }),

      setLoading: (loading) => set({ isLoading: loading }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      setCartOpen: (open) => set({ isOpen: open }),

      totalItems: () => {
        return get().items.reduce((sum: number, item: CartItemWithProduct) => sum + item.quantity, 0);
      },

      totalPrice: () => {
        return get().items.reduce(
          (sum: number, item: CartItemWithProduct) => sum + Number(item.product?.price || 0) * item.quantity,
          0
        );
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
);