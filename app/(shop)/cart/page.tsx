"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalItems, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white rounded-lg border border-[#DEE2E7] p-12 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-[#1C1C1C] mb-4">Your cart is empty</h2>
            <p className="text-[#8B96A5] mb-6">Looks like you haven't added anything yet.</p>
            <Link href="/products">
              <Button className="bg-gradient-to-b from-[#127FFF] to-[#0067FF]">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const discount = 60;
  const tax = 14;
  const finalTotal = totalPrice - discount + tax;

  return (
    <div className="min-h-screen bg-[#F7FAFC] py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-semibold text-[#1C1C1C] mb-6">
          My cart ({totalItems})
        </h1>

        <div className="flex gap-6">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-lg border border-[#DEE2E7] overflow-hidden">
              {items.map((item, index) => (
                <div
                  key={item.productId}
                  className={`p-4 flex gap-4 ${
                    index !== items.length - 1 ? "border-b border-[#DEE2E7]" : ""
                  }`}
                >
                  <div className="relative w-20 h-20 bg-[#F7F7F7] rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={item.product.images?.[0] || "/images/placeholder.png"}
                      alt={item.product.name}
                      fill
                      className="object-contain p-2"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/images/placeholder.png"; }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.product.slug}`}>
                      <h3 className="text-[#1C1C1C] font-medium hover:text-[#0D6EFD] transition-colors truncate">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-[#8B96A5] text-sm mt-1">Size: M, Color: Blue</p>

                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-[#FA3434] text-sm hover:underline"
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => toast.info("Saved for later")}
                        className="text-[#0D6EFD] text-sm hover:underline"
                      >
                        Save for later
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-[#DEE2E7] rounded-md">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="px-3 py-1 hover:bg-gray-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-1 min-w-[40px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="px-3 py-1 hover:bg-gray-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-[#1C1C1C] font-semibold min-w-[80px] text-right">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/products">
              <Button variant="outline" className="mt-4 border-[#DEE2E7]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to shop
              </Button>
            </Link>
          </div>

          {/* Order Summary */}
          <div className="w-[280px] shrink-0">
            <div className="bg-white rounded-lg border border-[#DEE2E7] p-4 shadow-lg">
              <h2 className="text-[#1C1C1C] font-medium mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[#505050]">
                  <span>Total price:</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-[#505050]">
                  <span>Discount:</span>
                  <span className="text-[#FA3434]">- {formatPrice(discount)}</span>
                </div>
                <div className="flex justify-between text-[#505050]">
                  <span>Tax:</span>
                  <span className="text-[#00B517]">+ {formatPrice(tax)}</span>
                </div>
              </div>

              <div className="border-t border-[#E4E4E4] my-4" />

              <div className="flex justify-between font-semibold text-[#1C1C1C]">
                <span>Total:</span>
                <span className="text-xl">{formatPrice(finalTotal)}</span>
              </div>

              <Button className="w-full mt-4 bg-[#00B517] hover:bg-[#00B517]/90 text-white h-12 text-lg">
                Checkout
              </Button>

              <div className="flex justify-center gap-2 mt-4">
                {["visa", "mastercard", "amex", "paypal"].map((payment) => (
                  <div
                    key={payment}
                    className="w-10 h-6 border border-[#EEEEEE] rounded flex items-center justify-center"
                  >
                    <span className="text-xs text-[#8B96A5]">{payment[0].toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-lg border border-[#DEE2E7] p-4 mt-4">
              <p className="text-[#505050] text-sm mb-3">Have a coupon?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add coupon"
                  className="flex-1 border border-[#E0E0E0] rounded-md px-3 py-2 text-sm"
                />
                <Button variant="outline" className="border-[#DEE2E7] text-[#0D6EFD]">
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}