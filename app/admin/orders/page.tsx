"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PaginationControls } from "@/components/admin/pagination-controls";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  shippingName: string;
  user: { name: string | null; email: string };
  items: { id: string }[];
  createdAt: string;
}

const STATUS_OPTIONS = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
  PENDING: "secondary",
  PROCESSING: "default",
  SHIPPED: "default",
  DELIVERED: "default",
  CANCELLED: "destructive",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [stats, setStats] = useState({ total: 0, pending: 0, delivered: 0, revenue: 0 });

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const fetchOrders = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?page=${pageNum}&limit=50`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
        if (data.pagination) setPagination(data.pagination);
        if (data.stats) setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      }
    } catch (error) {
      console.error("Failed to update order:", error);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Orders</h1>
        <p className="text-text-secondary text-sm mt-1">Manage customer orders and fulfillment</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Orders", value: stats.total },
          { label: "Revenue", value: formatPrice(stats.revenue) },
          { label: "Pending", value: stats.pending },
          { label: "Delivered", value: stats.delivered },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-surface p-4">
            <p className="text-sm text-text-secondary">{stat.label}</p>
            <p className="text-2xl font-bold text-text-primary mt-1">{loading ? "—" : stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Order</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary hidden sm:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary hidden md:table-cell">Items</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Total</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">No orders yet</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-background transition-colors">
                    <td className="px-4 py-3 font-medium text-text-primary">#{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="text-text-primary">{order.user.name || order.shippingName}</p>
                      <p className="text-xs text-text-secondary">{order.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden sm:table-cell">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden md:table-cell">{order.items.length}</td>
                    <td className="px-4 py-3 font-medium text-text-primary">{formatPrice(Number(order.total))}</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        disabled={updating === order.id}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        aria-label={`Update status for order ${order.orderNumber}`}
                        className="text-xs border border-border rounded-md px-2 py-1 bg-surface text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <Badge variant={statusColors[order.status] ?? "default"} className="ml-2 hidden lg:inline-flex">
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <PaginationControls
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
