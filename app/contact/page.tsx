import type { Metadata } from "next";
import { Mail, MapPin } from "lucide-react";

export const metadata: Metadata = { title: "Contact Us" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-text-primary mb-6">Contact Us</h1>
      <p className="text-text-secondary mb-8">
        This is a portfolio demo store, so there&apos;s no live support team — but here&apos;s how
        a real storefront would typically surface this information.
      </p>
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
          <Mail className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-text-primary">Email</p>
            <p className="text-sm text-text-secondary">support@nexmart.example</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
          <MapPin className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-text-primary">Address</p>
            <p className="text-sm text-text-secondary">This is a demo project with no physical location.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
