"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCartAPI } from "@/hooks/useCartAPI";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  Trash2, 
  Minus, 
  Plus, 
  ArrowRight,
  Package,
  Truck,
  Shield
} from "lucide-react";

/**
 * Cart Page
 * 
 * Client Component because:
 * 1. Uses useCartAPI (which uses useSession + Zustand)
 * 2. Real-time quantity updates
 * 3. Dynamic price calculations
 * 
 * WHY server-side cart persistence:
 * - Cart survives across devices when logged in
 * - Can be analyzed for recommendations
 * - Enables "abandoned cart" recovery emails
 * - Guest cart uses localStorage fallback
 */
export default function CartPage() {
  const { data: session } = useSession();
  const { 
    items, 
    isLoading, 
    totalItems, 
    totalPrice, 
    removeFromCart, 
    updateQuantity,
    syncWithServer 
  } = useCartAPI();

  // Sync cart with server on mount (for logged-in users)
  useEffect(() => {
    if (session?.user) {
      syncWithServer();
    }
  }, [session, syncWithServer]);

  const shipping = totalPrice > 500 ? 0 : 15;
  const tax = totalPrice * 0.08; // 8% tax
  const grandTotal = totalPrice + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="h-24 w-24 rounded-full bg-primary-50 flex items-center justify-center mb-6">
            <ShoppingCart className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-heading-1 text-text-primary mb-2">Your Cart is Empty</h1>
          <p className="text-text-secondary mb-6 max-w-md">
            Looks like you haven&apos;t added anything to your cart yet. Browse our products and find something you love!
          </p>
          <Link href="/products">
            <Button size="lg">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-heading-1 text-text-primary mb-2">Shopping Cart</h1>
      <p className="text-text-secondary mb-8">{totalItems} items in your cart</p>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="flex gap-4 p-4 rounded-xl border border-border bg-surface hover:shadow-card transition-shadow"
            >
              {/* Product Image */}
              <Link 
                href={`/product/${item.product.slug}`}
                className="relative h-24 w-24 sm:h-32 sm:w-32 shrink-0 rounded-lg overflow-hidden bg-background"
              >
                <Image
                  src={item.product.images[0] || "/placeholder-product.jpg"}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </Link>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/product/${item.product.slug}`}>
                      <h3 className="text-sm font-medium text-text-primary hover:text-primary transition-colors line-clamp-2">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-text-secondary mt-1">{item.product.category.name}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-text-secondary hover:text-danger transition-colors p-1"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-end justify-between mt-3">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-border rounded-lg bg-background">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1 || isLoading}
                      className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock || isLoading}
                      className="h-8 w-8 flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text-primary">
                      {formatPrice(Number(item.product.price) * item.quantity)}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {formatPrice(Number(item.product.price))} each
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Continue Shopping */}
          <Link href="/products" className="inline-flex items-center text-sm text-primary hover:underline mt-4">
            <ArrowRight className="h-4 w-4 mr-1 rotate-180" />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-border bg-surface p-6 space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal ({totalItems} items)</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span className="flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  Shipping
                </span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Tax (8%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-primary">
                  Add {formatPrice(500 - totalPrice)} more for free shipping!
                </p>
              )}
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-text-primary">Total</span>
                <span className="text-xl font-bold text-primary">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <Button size="lg" className="w-full" disabled={isLoading}>
              Proceed to Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="flex flex-col items-center gap-1 text-center">
                <Package className="h-5 w-5 text-text-secondary" />
                <span className="text-[10px] text-text-secondary">Secure</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <Truck className="h-5 w-5 text-text-secondary" />
                <span className="text-[10px] text-text-secondary">Fast</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <Shield className="h-5 w-5 text-text-secondary" />
                <span className="text-[10px] text-text-secondary">Protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
