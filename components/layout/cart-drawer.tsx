"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, totalItems, clearCart } = useCart();

  // Mock products for display (in real app, fetch from API)
  const mockProducts: Record<string, { name: string; price: number; image: string; slug: string }> = {
    "prod-1": { name: "Sony WH-1000XM5", price: 349.99, image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=200&q=80", slug: "sony-wh-1000xm5" },
  };

  const subtotal = items.reduce((sum, item) => {
    const product = mockProducts[item.productId];
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Shopping Cart ({totalItems()})</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-hover rounded-lg" aria-label="Close cart">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-border mx-auto mb-3" />
              <p className="text-text-secondary">Your cart is empty</p>
              <Button variant="outline" className="mt-4" onClick={onClose}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const product = mockProducts[item.productId] || { name: "Product", price: 0, image: "/images/placeholder.png", slug: "#" };
                return (
                  <div key={item.productId} className="flex gap-3 p-3 bg-surface rounded-lg">
                    <Link href={`/product/${product.slug}`} className="shrink-0">
                      <div className="relative w-16 h-16 bg-white rounded overflow-hidden">
                        <Image src={product.image} alt={product.name} fill className="object-contain p-1" sizes="64px" />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${product.slug}`} className="text-sm font-medium text-text-primary hover:text-primary truncate block">
                        {product.name}
                      </Link>
                      <p className="text-primary font-bold text-sm mt-1">{formatPrice(product.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-border rounded">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-surface-hover"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-surface-hover"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-1.5 text-danger hover:bg-red-50 rounded"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatPrice(product.price * item.quantity)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Subtotal</span>
              <span className="font-bold">{formatPrice(subtotal)}</span>
            </div>
            <Button className="w-full" size="lg" onClick={onClose}>
              Checkout
            </Button>
            <Button variant="outline" className="w-full" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}