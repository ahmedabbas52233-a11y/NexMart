"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalItems } = useCart();

  // Mock product data for display (in real app, fetch from API)
  const mockProducts: Record<string, { name: string; price: number; image: string; slug: string }> = {
    "prod-1": { name: "Sony WH-1000XM5", price: 349.99, image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=200&q=80", slug: "sony-wh-1000xm5" },
  };

  const subtotal = items.reduce((sum, item) => {
    const product = mockProducts[item.productId];
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-[#DEE2E7] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1C1C1C]">Your cart is empty</h2>
          <p className="text-[#8B96A5] mt-2">Looks like you haven&apos;t added anything yet.</p>
          <Link href="/products">
            <Button className="mt-6">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1C1C1C] mb-6">Shopping Cart ({totalItems()})</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {items.map((item) => {
              const product = mockProducts[item.productId] || { name: "Product", price: 0, image: "/images/placeholder.png", slug: "#" };
              return (
                <div key={item.productId} className="bg-white rounded-lg border border-[#DEE2E7] p-4 flex gap-4">
                  <Link href={`/product/${product.slug}`} className="shrink-0">
                    <div className="relative w-24 h-24 bg-[#F7FAFC] rounded-lg overflow-hidden">
                      <Image src={product.image} alt={product.name} fill className="object-contain p-2" sizes="96px" />
                    </div>
                  </Link>
                  <div className="flex-1">
                    <Link href={`/product/${product.slug}`} className="font-medium text-[#1C1C1C] hover:text-[#0D6EFD]">
                      {product.name}
                    </Link>
                    <p className="text-[#0D6EFD] font-bold mt-1">{formatPrice(product.price)}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-[#DEE2E7] rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-[#F3F5F9]"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-[#F3F5F9]"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-[#FA3434] hover:text-red-700 p-2"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#1C1C1C]">{formatPrice(product.price * item.quantity)}</p>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" onClick={clearCart} className="text-[#FA3434] border-[#FA3434] hover:bg-red-50">
                Clear Cart
              </Button>
              <Link href="/products">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-lg border border-[#DEE2E7] p-6 sticky top-24">
              <h2 className="text-lg font-bold text-[#1C1C1C] mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[#8B96A5]">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#8B96A5]">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                <div className="border-t border-[#DEE2E7] pt-3 flex justify-between font-bold text-[#1C1C1C] text-base">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <Button className="w-full mt-6" size="lg">
                Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-xs text-[#8B96A5] text-center mt-3">
                Shipping &amp; taxes calculated at checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}