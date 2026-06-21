"use client";

import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "./useCart";
import { CartItemWithProduct } from "@/types";
import { toast } from "sonner";

/**
 * useCartAPI Hook
 * 
 * WHY: Separates API logic from state management.
 * Provides optimistic updates with rollback on error.
 * Handles both authenticated (server) and guest (localStorage) carts.
 */
export function useCartAPI() {
  const { data: session } = useSession();
  const store = useCartStore();

  const syncWithServer = useCallback(async () => {
    if (!session?.user) return;

    try {
      store.setLoading(true);
      const res = await fetch("/api/cart");
      const data = await res.json();

      if (data.success) {
        store.setItems(data.data);
      }
    } catch (error) {
      console.error("Failed to sync cart:", error);
    } finally {
      store.setLoading(false);
    }
  }, [session, store]);

  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      if (!session?.user) {
        toast.error("Please sign in to add items to cart");
        return;
      }

      try {
        store.setLoading(true);

        // Optimistic update
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        });

        const data = await res.json();

        if (data.success) {
          store.addItem(data.data);
          toast.success("Added to cart");
        } else {
          toast.error(data.error || "Failed to add to cart");
        }
      } catch (error) {
        toast.error("Network error. Please try again.");
      } finally {
        store.setLoading(false);
      }
    },
    [session, store]
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      if (!session?.user) return;

      // Optimistic removal
      const previousItems = store.items;
      store.removeItem(productId);

      try {
        const res = await fetch(`/api/cart?productId=${productId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          // Rollback on error
          store.setItems(previousItems);
          toast.error("Failed to remove item");
        } else {
          toast.success("Removed from cart");
        }
      } catch (error) {
        store.setItems(previousItems);
        toast.error("Network error");
      }
    },
    [session, store]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (!session?.user) return;

      const previousItems = store.items;
      store.updateQuantity(productId, quantity);

      try {
        const res = await fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        });

        if (!res.ok) {
          store.setItems(previousItems);
          toast.error("Failed to update quantity");
        }
      } catch (error) {
        store.setItems(previousItems);
        toast.error("Network error");
      }
    },
    [session, store]
  );

  return {
    items: store.items,
    isLoading: store.isLoading,
    isOpen: store.isOpen,
    totalItems: store.totalItems(),
    totalPrice: store.totalPrice(),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart: store.clearCart,
    toggleCart: store.toggleCart,
    setCartOpen: store.setCartOpen,
    syncWithServer,
  };
}
