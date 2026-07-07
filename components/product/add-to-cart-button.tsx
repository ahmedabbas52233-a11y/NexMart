"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";
import { useCartAPI } from "@/hooks/useCartAPI";

interface AddToCartButtonProps {
  productId: string;
  className?: string;
  disabled?: boolean;
}

export function AddToCartButton({ productId, className, disabled }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const { addToCart } = useCartAPI();

  const handleAdd = async () => {
    if (disabled) return;
    const success = await addToCart(productId, 1);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <Button
      onClick={handleAdd}
      className={className}
      variant={added ? "outline" : "primary"}
      disabled={added || disabled}
    >
      {added ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Added
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </>
      )}
    </Button>
  );
}