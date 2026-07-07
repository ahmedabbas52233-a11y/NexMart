import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-text-primary mb-6">Terms &amp; Conditions</h1>
      <div className="prose prose-sm max-w-none text-text-secondary space-y-4 text-sm leading-relaxed">
        <p><em>This is a demo policy for a portfolio project, not a real legal document.</em></p>

        <h2 className="text-lg font-semibold text-text-primary mt-6">Demo store</h2>
        <p>
          NexMart is a demonstration e-commerce application. No real payments are processed,
          no products are actually shipped, and no purchase creates a binding transaction.
        </p>

        <h2 className="text-lg font-semibold text-text-primary mt-6">Accounts</h2>
        <p>
          You&apos;re responsible for keeping your account credentials confidential. Don&apos;t
          reuse a password you use on real, sensitive accounts elsewhere.
        </p>

        <h2 className="text-lg font-semibold text-text-primary mt-6">Acceptable use</h2>
        <p>
          Don&apos;t attempt to abuse rate limits, probe for vulnerabilities beyond reasonable
          testing, or use this demo to store real personal or payment information.
        </p>
      </div>
    </div>
  );
}
