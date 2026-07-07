"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { Heart, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ProductActionsProps {
  productId: string;
  productName: string;
}

export function ProductActions({ productId, productName }: ProductActionsProps) {
  const { toggle, isSaved, loading } = useWishlist();
  const saved = isSaved(productId);

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: productName, url });
      } catch {
        // User cancelled the share sheet — no action needed.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <>
      <Button
        variant={saved ? "primary" : "secondary"}
        size="lg"
        className="flex-1"
        onClick={() => toggle(productId)}
        disabled={loading}
      >
        <Heart className={cn("h-5 w-5 mr-2", saved && "fill-white")} />
        {saved ? "Saved" : "Wishlist"}
      </Button>
      <Button variant="ghost" size="icon" className="h-12 w-12" onClick={handleShare} aria-label="Share this product">
        <Share2 className="h-5 w-5" />
      </Button>
    </>
  );
}
