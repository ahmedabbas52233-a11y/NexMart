"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/admin/pagination-controls";
import { Search, User as UserIcon } from "lucide-react";

interface Customer {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/customers?page=${page}&limit=50`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCustomers(data.data);
          if (data.pagination) setPagination(data.pagination);
        }
      })
      .catch((error) => console.error("Failed to fetch customers:", error))
      .finally(() => setLoading(false));
  }, [page]);

  // Search filters only the currently loaded page — server-side search
  // (a `search` query param on /api/admin/customers, same pattern as
  // /api/products) would be the natural next step if the customer list
  // grows past a page or two.
  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Customers</h1>
        <p className="text-text-secondary text-sm mt-1">{customers.length} registered users</p>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
        <Input
          type="text"
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary hidden sm:table-cell">Joined</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Orders</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Total Spent</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">Loading customers...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">No customers found</td>
                </tr>
              ) : (
                filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-background transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                          {customer.image ? (
                            <Image src={customer.image} alt={customer.name || customer.email} width={32} height={32} className="object-cover" />
                          ) : (
                            <UserIcon className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-text-primary truncate">{customer.name || "—"}</p>
                          <p className="text-xs text-text-secondary truncate">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden sm:table-cell">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{customer.orderCount}</td>
                    <td className="px-4 py-3 font-medium text-text-primary">{formatPrice(customer.totalSpent)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={customer.role === "ADMIN" ? "default" : "secondary"}>{customer.role}</Badge>
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
