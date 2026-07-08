"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalUsers: number;
  totalProducts: number;
  revenueByDay: { date: string; revenue: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
}

function RevenueBarChart({ data }: { data: { date: string; revenue: number }[] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const width = 700;
  const height = 200;
  const barWidth = width / data.length;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48" preserveAspectRatio="none">
      {data.map((d, i) => {
        const barHeight = (d.revenue / max) * (height - 10);
        return (
          <rect
            key={d.date}
            x={i * barWidth + 1}
            y={height - barHeight}
            width={Math.max(barWidth - 2, 1)}
            height={barHeight}
            fill={d.revenue > 0 ? "#0D6EFD" : "#E5E7EB"}
            rx={1}
          >
            <title>{`${d.date}: ${formatPrice(d.revenue)}`}</title>
          </rect>
        );
      })}
    </svg>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .catch((error) => console.error("Failed to fetch analytics:", error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
        <p className="text-text-secondary text-sm mt-1">Last 30 days</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Revenue (30d)", value: data ? formatPrice(data.totalRevenue) : "—" },
          { label: "Orders (30d)", value: data?.totalOrders ?? "—" },
          { label: "Avg Order Value", value: data ? formatPrice(data.avgOrderValue) : "—" },
          { label: "Total Customers", value: data?.totalUsers ?? "—" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-surface p-4">
            <p className="text-sm text-text-secondary">{stat.label}</p>
            <p className="text-2xl font-bold text-text-primary mt-1">{loading ? "—" : stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 mb-6">
        <h2 className="font-semibold text-text-primary mb-4">Revenue — Last 30 Days</h2>
        {loading || !data ? (
          <p className="text-sm text-text-secondary">Loading chart...</p>
        ) : data.revenueByDay.every((d) => d.revenue === 0) ? (
          <p className="text-sm text-text-secondary">No orders in this period yet.</p>
        ) : (
          <RevenueBarChart data={data.revenueByDay} />
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-text-primary">Top Products (30d)</h2>
        </div>
        <div className="divide-y divide-border-light">
          {loading ? (
            <p className="px-5 py-6 text-sm text-text-secondary">Loading...</p>
          ) : !data || data.topProducts.length === 0 ? (
            <p className="px-5 py-6 text-sm text-text-secondary">No sales in this period yet.</p>
          ) : (
            data.topProducts.map((product) => (
              <div key={product.name} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-text-primary">{product.name}</p>
                  <p className="text-xs text-text-secondary">{product.quantity} sold</p>
                </div>
                <span className="text-sm font-medium text-text-primary">{formatPrice(product.revenue)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
