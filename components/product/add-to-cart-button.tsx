"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCartAPI } from "@/hooks/useCartAPI";
import { Button } from "@/components/ui/button";

interface AddToCartButtonProps {
  productId: string;
  disabled?: boolean;
}

export function AddToCartButton({ productId, disabled = false }: AddToCartButtonProps) {
  const { addToCart } = useCartAPI();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    await addToCart(productId, 1);
    setIsLoading(false);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className="w-full"
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      {isLoading ? "Adding..." : "Add to Cart"}
    </Button>
  );
}