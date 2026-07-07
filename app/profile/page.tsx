"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Package, Heart, LogOut } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  items: { id: string }[];
  createdAt: string;
}

const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
  PENDING: "secondary",
  PROCESSING: "default",
  SHIPPED: "default",
  DELIVERED: "default",
  CANCELLED: "destructive",
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      setLoading(false);
      return;
    }

    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrders(data.data);
      })
      .catch((error) => console.error("Failed to fetch orders:", error))
      .finally(() => setLoading(false));
  }, [session, status]);

  if (status !== "loading" && !session?.user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-heading-2 text-text-primary mb-2">Sign in to view your profile</h1>
        <Link href="/auth/signin?callbackUrl=/profile">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="rounded-xl border border-border bg-surface p-6 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-text-primary">{session?.user?.name || "My Account"}</p>
            <p className="text-sm text-text-secondary">{session?.user?.email}</p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Link href="/wishlist" className="rounded-xl border border-border bg-surface p-5 flex items-center gap-3 hover:border-primary transition-colors">
          <Heart className="h-5 w-5 text-primary" />
          <span className="font-medium text-text-primary">My Wishlist</span>
        </Link>
        <Link href="/products" className="rounded-xl border border-border bg-surface p-5 flex items-center gap-3 hover:border-primary transition-colors">
          <Package className="h-5 w-5 text-primary" />
          <span className="font-medium text-text-primary">Browse Products</span>
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-text-primary">Order History</h2>
        </div>
        <div className="divide-y divide-border-light">
          {loading ? (
            <p className="px-5 py-6 text-sm text-text-secondary">Loading...</p>
          ) : orders.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-text-secondary mb-4">You haven&apos;t placed any orders yet.</p>
              <Link href="/products">
                <Button size="sm">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-background transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">#{order.orderNumber}</p>
                  <p className="text-xs text-text-secondary">
                    {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusColors[order.status] ?? "default"}>{order.status}</Badge>
                  <span className="text-sm font-medium text-text-primary">{formatPrice(Number(order.total))}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
