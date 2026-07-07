"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export function useWishlist() {
  const { data: session } = useSession();
  const [productIds, setProductIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!session?.user) {
      setProductIds(new Set());
      return;
    }

    try {
      const res = await fetch("/api/wishlist");
      const data = await res.json();
      if (data.success) {
        setProductIds(new Set(data.data.map((item: { productId: string }) => item.productId)));
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    }
  }, [session]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = useCallback(
    async (productId: string) => {
      if (!session?.user) {
        toast.error("Please sign in to save items to your wishlist");
        return;
      }

      const isSaved = productIds.has(productId);
      setLoading(true);

      // Optimistic update
      setProductIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.delete(productId);
        else next.add(productId);
        return next;
      });

      try {
        const res = await fetch(
          isSaved ? `/api/wishlist?productId=${productId}` : "/api/wishlist",
          {
            method: isSaved ? "DELETE" : "POST",
            headers: { "Content-Type": "application/json" },
            body: isSaved ? undefined : JSON.stringify({ productId }),
          }
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to update wishlist");
        }

        toast.success(isSaved ? "Removed from wishlist" : "Added to wishlist");
      } catch (error) {
        // Revert the optimistic update on failure
        setProductIds((prev) => {
          const next = new Set(prev);
          if (isSaved) next.add(productId);
          else next.delete(productId);
          return next;
        });
        toast.error(error instanceof Error ? error.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [session, productIds]
  );

  const isSaved = useCallback((productId: string) => productIds.has(productId), [productIds]);

  return { toggle, isSaved, loading, refresh, count: productIds.size };
}
