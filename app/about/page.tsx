import type { Metadata } from "next";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-text-primary mb-6">About NexMart</h1>
      <div className="prose prose-sm max-w-none text-text-secondary space-y-4">
        <p>
          NexMart is a full-stack e-commerce demo built with Next.js 14, Prisma, and NextAuth —
          a portfolio project showcasing product browsing, cart and wishlist management,
          checkout, and an admin dashboard for managing products, orders, and customers.
        </p>
        <p>
          Everything you see here — products, categories, and orders — runs against a real
          database with real business logic: stock validation, rate-limited authentication,
          role-based admin access, and a complete (if simplified) checkout flow.
        </p>
        <p>
          This is a demo storefront rather than a live retailer, so no real payments are
          processed and shipments aren&apos;t actually fulfilled — but the underlying code paths
          (cart, stock decrement, order history) are fully functional.
        </p>
      </div>
    </div>
  );
}
