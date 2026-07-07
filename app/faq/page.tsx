import type { Metadata } from "next";

export const metadata: Metadata = { title: "FAQ" };

const faqs = [
  {
    q: "Is this a real store?",
    a: "No — NexMart is a portfolio/demo e-commerce project. Products, orders, and accounts are real database records, but no real payments are processed and nothing is actually shipped.",
  },
  {
    q: "Can I really create an account and place an order?",
    a: "Yes. Sign-up, sign-in, cart, checkout, and order history are all fully functional against a real database — placing an order creates a real Order record and decrements real product stock.",
  },
  {
    q: "How does shipping and tax work?",
    a: "Orders over $500 get free shipping; otherwise a flat $15 shipping fee applies, plus an 8% tax rate on the subtotal. These are demo values, not configurable per-order.",
  },
  {
    q: "Is my data safe?",
    a: "Passwords are hashed with bcrypt, login attempts are rate-limited, and admin routes are access-controlled. That said, this is a demo — avoid using a real password you use elsewhere.",
  },
  {
    q: "Can I return items?",
    a: "There's no returns workflow in this demo — orders are for demonstration purposes only.",
  },
];

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-text-primary mb-6">Frequently Asked Questions</h1>
      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.q} className="rounded-xl border border-border bg-surface p-5">
            <h2 className="font-semibold text-text-primary mb-2">{faq.q}</h2>
            <p className="text-sm text-text-secondary">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
