"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartAPI } from "@/hooks/useCartAPI";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Minus, Plus, ShoppingCart, ArrowRight } from "lucide-react";

/**
 * Cart Drawer (Slide-over)
 * 
 * WHY: Provides instant cart access from any page without navigation.
 * Uses Zustand isOpen state for global toggle (header button triggers it).
 * 
 * Architecture:
 * - Overlay blocks interaction with background
 * - Slide animation for smooth UX
 * - Quantity controls update in real-time
 * - Links to full cart page for checkout
 */
export function CartDrawer() {
  const { 
    items, 
    isOpen, 
    setCartOpen, 
    totalItems, 
    totalPrice, 
    removeFromCart, 
    updateQuantity 
  } = useCartAPI();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface shadow-2xl animate-slide-up flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-text-primary">Your Cart</h2>
            <span className="text-sm text-text-secondary">({totalItems} items)</span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-surface-hover transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5 text-text-secondary" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="h-12 w-12 text-text-secondary mb-3" />
              <p className="text-text-secondary">Your cart is empty</p>
              <Button 
                variant="secondary" 
                className="mt-4"
                onClick={() => setCartOpen(false)}
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 rounded-lg border border-border bg-background">
                <Link 
                  href={`/product/${item.product.slug}`}
                  className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-surface"
                  onClick={() => setCartOpen(false)}
                >
                  <Image
                   src={item.product.images?.[0] || "/placeholder-product.svg"}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/product/${item.product.slug}`}
                    onClick={() => setCartOpen(false)}
                  >
                    <h3 className="text-sm font-medium text-text-primary hover:text-primary transition-colors line-clamp-1">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-text-secondary mt-0.5">{item.product.category?.name}</p>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-border rounded-md bg-surface">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="h-7 w-7 flex items-center justify-center text-text-secondary hover:text-text-primary"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="h-7 w-7 flex items-center justify-center text-text-secondary hover:text-text-primary"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">
                        {formatPrice(Number(item.product.price) * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-text-secondary hover:text-danger transition-colors"
                        aria-label="Remove item"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Subtotal</span>
              <span className="text-lg font-bold text-text-primary">{formatPrice(totalPrice)}</span>
            </div>
            <p className="text-xs text-text-secondary">
              Shipping and taxes calculated at checkout
            </p>
            <Link href="/cart" onClick={() => setCartOpen(false)}>
              <Button size="lg" fullWidth>
                View Cart & Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
