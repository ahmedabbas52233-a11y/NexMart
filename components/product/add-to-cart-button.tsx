"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartAPI } from "@/hooks/useCartAPI";

/**
 * AddToCartButton
 * 
 * Client Component because:
 * 1. Uses useState for quantity counter
 * 2. Calls useCartAPI which uses useSession
 * 3. Triggers toast notifications
 * 
 * WHY separate component:
 * - Keeps ProductPage as Server Component (SEO)
 * - Isolates interactive logic
 * - Reusable across the app
 */
interface AddToCartButtonProps {
  productId: string;
  maxStock: number;
  disabled?: boolean;
}

export function AddToCartButton({ productId, maxStock, disabled }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, isLoading } = useCartAPI();

  const decreaseQty = () => setQuantity((prev) => Math.max(1, prev - 1));
  const increaseQty = () => setQuantity((prev) => Math.min(maxStock, prev + 1));

  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-1">
      {/* Quantity Selector */}
      <div className="flex items-center border border-border rounded-lg bg-surface">
        <button
          onClick={decreaseQty}
          disabled={quantity <= 1}
          className="h-12 w-12 flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-12 text-center font-medium text-text-primary">{quantity}</span>
        <button
          onClick={increaseQty}
          disabled={quantity >= maxStock}
          className="h-12 w-12 flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Add to Cart */}
      <Button
        size="lg"
        className="flex-1"
        disabled={disabled || isLoading}
        onClick={() => addToCart(productId, quantity)}
      >
        <ShoppingCart className="h-5 w-5 mr-2" />
        {disabled ? "Out of Stock" : "Add to Cart"}
      </Button>
    </div>
  );
}
