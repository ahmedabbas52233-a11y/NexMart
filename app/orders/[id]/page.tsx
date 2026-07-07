"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Package } from "lucide-react";

interface OrderItem {
  id: string;
  productName: string;
  productImage: string | null;
  price: string;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: string;
  items: OrderItem[];
  createdAt: string;
}

const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
  PENDING: "secondary",
  PROCESSING: "default",
  SHIPPED: "default",
  DELIVERED: "default",
  CANCELLED: "destructive",
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrder(data.data);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-center text-text-secondary">Loading...</div>;
  }

  if (notFound || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-heading-2 text-text-primary mb-2">Order not found</h1>
        <Link href="/profile">
          <Button>View My Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h1 className="text-heading-1 text-text-primary mb-1">Order Placed!</h1>
        <p className="text-text-secondary">Order #{order.orderNumber}</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text-primary">Order Status</h2>
          <Badge variant={statusColors[order.status] ?? "default"}>{order.status}</Badge>
        </div>

        <div className="space-y-3 mb-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-background shrink-0">
                <Image
                  src={item.productImage || "/placeholder-product.svg"}
                  alt={item.productName}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-primary truncate">{item.productName}</p>
                <p className="text-xs text-text-secondary">Qty {item.quantity}</p>
              </div>
              <span className="text-sm font-medium text-text-primary">
                {formatPrice(Number(item.price) * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-text-secondary">
            <span>Subtotal</span>
            <span>{formatPrice(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Shipping</span>
            <span>{Number(order.shipping) === 0 ? "Free" : formatPrice(Number(order.shipping))}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Tax</span>
            <span>{formatPrice(Number(order.tax))}</span>
          </div>
          <div className="flex justify-between font-semibold text-text-primary pt-2 border-t border-border">
            <span>Total</span>
            <span>{formatPrice(Number(order.total))}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 mb-6">
        <h2 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
          <Package className="h-4 w-4" /> Shipping To
        </h2>
        <p className="text-sm text-text-secondary">
          {order.shippingName}<br />
          {order.shippingAddress}<br />
          {order.shippingCity}, {order.shippingState} {order.shippingZip}<br />
          {order.shippingCountry}
        </p>
      </div>

      <div className="flex gap-3">
        <Link href="/products" className="flex-1">
          <Button variant="secondary" fullWidth>Continue Shopping</Button>
        </Link>
        <Link href="/profile" className="flex-1">
          <Button fullWidth>View All Orders</Button>
        </Link>
      </div>
    </div>
  );
}
