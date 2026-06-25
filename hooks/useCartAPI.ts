"use client";

import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "./useCart";
import { toast } from "sonner";

export function useCartAPI() {
  const { data: session } = useSession();
  const { addItem, removeItem, updateQuantity, items, totalItems, totalPrice } = useCart();

  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      addItem(productId, quantity);

      if (session?.user) {
        try {
          const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, quantity }),
          });

          if (!res.ok) {
            const data = await res.json();
            toast.error(data.error || "Failed to add to cart");
            return;
          }

          toast.success("Added to cart");
        } catch {
          toast.error("Network error");
        }
      } else {
        toast.success("Added to cart");
      }
    },
    [session, addItem]
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      removeItem(productId);

      if (session?.user) {
        try {
          await fetch(`/api/cart?productId=${productId}`, {
            method: "DELETE",
          });
        } catch {
          toast.error("Failed to remove item");
        }
      }
    },
    [session, removeItem]
  );

  const updateCartQuantity = useCallback(
    async (productId: string, quantity: number) => {
      updateQuantity(productId, quantity);

      if (session?.user) {
        try {
          await fetch("/api/cart", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, quantity }),
          });
        } catch {
          toast.error("Failed to update quantity");
        }
      }
    },
    [session, updateQuantity]
  );

  return {
    addToCart,
    removeFromCart,
    updateCartQuantity,
    items,
    totalItems,
    totalPrice,
    isAuthenticated: !!session?.user,
    isLoading: false,
  };
}