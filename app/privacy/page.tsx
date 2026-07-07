import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-text-primary mb-6">Privacy Policy</h1>
      <div className="prose prose-sm max-w-none text-text-secondary space-y-4 text-sm leading-relaxed">
        <p><em>This is a demo policy for a portfolio project, not a real legal document.</em></p>

        <h2 className="text-lg font-semibold text-text-primary mt-6">What we store</h2>
        <p>
          Account email, name, and a bcrypt-hashed password (or your Google profile info if you
          sign in with Google); cart, wishlist, and order data tied to your account; and standard
          request metadata (IP address) used only for rate-limiting abuse prevention.
        </p>

        <h2 className="text-lg font-semibold text-text-primary mt-6">What we don&apos;t do</h2>
        <p>
          We don&apos;t sell data, run advertising trackers, or share your information with third
          parties. This demo has no analytics or marketing cookies — the only cookie set is
          NextAuth&apos;s session cookie, required to keep you signed in.
        </p>

        <h2 className="text-lg font-semibold text-text-primary mt-6">Deleting your data</h2>
        <p>
          Since this is a demo project without a live support team, there&apos;s no self-service
          account deletion flow — treat any data you enter here as non-sensitive test data.
        </p>
      </div>
    </div>
  );
}
