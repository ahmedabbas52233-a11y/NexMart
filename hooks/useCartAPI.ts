"use client";

import { useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "./useCart";
import { CartItemWithProduct } from "@/types";
import { toast } from "sonner";

export function useCartAPI() {
  const { data: session } = useSession();

  const items = useCartStore((state: { items: CartItemWithProduct[] }) => state.items);
  const isLoading = useCartStore((state: { isLoading: boolean }) => state.isLoading);
  const isOpen = useCartStore((state: { isOpen: boolean }) => state.isOpen);
  const addItem = useCartStore((state: { addItem: (item: CartItemWithProduct) => void }) => state.addItem);
  const removeItem = useCartStore((state: { removeItem: (productId: string) => void }) => state.removeItem);
  const updateQuantityStore = useCartStore((state: { updateQuantity: (productId: string, quantity: number) => void }) => state.updateQuantity);
  const setItems = useCartStore((state: { setItems: (items: CartItemWithProduct[]) => void }) => state.setItems);
  const setLoading = useCartStore((state: { setLoading: (loading: boolean) => void }) => state.setLoading);
  const clearCart = useCartStore((state: { clearCart: () => void }) => state.clearCart);
  const toggleCart = useCartStore((state: { toggleCart: () => void }) => state.toggleCart);
  const setCartOpen = useCartStore((state: { setCartOpen: (open: boolean) => void }) => state.setCartOpen);

  const totalItems = useMemo(
    () => items.reduce((sum: number, item: CartItemWithProduct) => sum + item.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum: number, item: CartItemWithProduct) => sum + Number(item.product?.price || 0) * item.quantity, 0),
    [items]
  );

  const syncWithServer = useCallback(async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      const res = await fetch("/api/cart");
      const data = await res.json();

      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      console.error("Failed to sync cart:", error);
    } finally {
      setLoading(false);
    }
  }, [session, setLoading, setItems]);

  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      if (!session?.user) {
        toast.error("Please sign in to add items to cart");
        return;
      }

      try {
        setLoading(true);

        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        });

        const data = await res.json();

        if (data.success) {
          addItem(data.data);
          toast.success("Added to cart");
        } else {
          toast.error(data.error || "Failed to add to cart");
        }
      } catch (error) {
        toast.error("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [session, addItem, setLoading]
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      if (!session?.user) return;

      const previousItems = items;
      removeItem(productId);

      try {
        const res = await fetch(`/api/cart?productId=${productId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          setItems(previousItems);
          toast.error("Failed to remove item");
        } else {
          toast.success("Removed from cart");
        }
      } catch (error) {
        setItems(previousItems);
        toast.error("Network error");
      }
    },
    [session, items, removeItem, setItems]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (!session?.user) return;

      const previousItems = items;
      updateQuantityStore(productId, quantity);

      try {
        const res = await fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        });

        if (!res.ok) {
          setItems(previousItems);
          toast.error("Failed to update quantity");
        }
      } catch (error) {
        setItems(previousItems);
        toast.error("Network error");
      }
    },
    [session, items, updateQuantityStore, setItems]
  );

  return {
    items,
    isLoading,
    isOpen,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    setCartOpen,
    syncWithServer,
  };
}