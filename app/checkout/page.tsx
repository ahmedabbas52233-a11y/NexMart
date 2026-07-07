"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useCartAPI } from "@/hooks/useCartAPI";
import { formatPrice, calculateOrderTotals } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, ShoppingBag } from "lucide-react";

const initialForm = {
  shippingName: "",
  shippingEmail: "",
  shippingAddress: "",
  shippingCity: "",
  shippingState: "",
  shippingZip: "",
  shippingCountry: "United States",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, totalPrice, syncWithServer, isLoading: cartLoading } = useCartAPI();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user) {
      syncWithServer();
      setForm((prev) => ({
        ...prev,
        shippingName: session.user.name || prev.shippingName,
        shippingEmail: session.user.email || prev.shippingEmail,
      }));
    }
  }, [session, syncWithServer]);

  const { shipping, tax, total } = calculateOrderTotals(totalPrice);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Order placed!");
        router.push(`/orders/${data.data.id}`);
      } else {
        setError(data.error || "Failed to place order");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status !== "loading" && !session?.user) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-heading-2 text-text-primary mb-2">Sign in to checkout</h1>
        <p className="text-text-secondary mb-6">You&apos;ll need an account to place an order.</p>
        <Link href="/auth/signin?callbackUrl=/checkout">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  if (!cartLoading && items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <ShoppingBag className="h-12 w-12 text-text-secondary mx-auto mb-4" />
        <h1 className="text-heading-2 text-text-primary mb-2">Your cart is empty</h1>
        <p className="text-text-secondary mb-6">Add something to your cart before checking out.</p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border bg-surface p-6">
            <h2 className="font-semibold text-text-primary mb-4">Shipping Information</h2>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-danger">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Full Name"
                value={form.shippingName}
                onChange={(e) => setForm({ ...form, shippingName: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={form.shippingEmail}
                onChange={(e) => setForm({ ...form, shippingEmail: e.target.value })}
                required
              />
              <Input
                label="Street Address"
                value={form.shippingAddress}
                onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={form.shippingCity}
                  onChange={(e) => setForm({ ...form, shippingCity: e.target.value })}
                  required
                />
                <Input
                  label="State / Province"
                  value={form.shippingState}
                  onChange={(e) => setForm({ ...form, shippingState: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="ZIP / Postal Code"
                  value={form.shippingZip}
                  onChange={(e) => setForm({ ...form, shippingZip: e.target.value })}
                  required
                />
                <Input
                  label="Country"
                  value={form.shippingCountry}
                  onChange={(e) => setForm({ ...form, shippingCountry: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Lock className="h-4 w-4" />
              This is a portfolio demo — no real payment is processed. Placing an order creates it directly.
            </div>
          </div>

          <Button type="submit" size="lg" fullWidth isLoading={submitting}>
            Place Order — {formatPrice(total)}
          </Button>
        </form>

        <div className="rounded-xl border border-border bg-surface p-6 h-fit space-y-4">
          <h2 className="font-semibold text-text-primary">Order Summary</h2>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-background shrink-0">
                  <Image
                    src={item.product.images?.[0] || "/placeholder-product.svg"}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text-primary truncate">{item.product.name}</p>
                  <p className="text-xs text-text-secondary">Qty {item.quantity}</p>
                </div>
                <span className="text-sm font-medium text-text-primary">
                  {formatPrice(Number(item.product.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Tax</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between font-semibold text-text-primary pt-2 border-t border-border">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
