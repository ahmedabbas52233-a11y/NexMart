import Link from "next/link";

/**
 * Global Not Found Page
 *
 * Renders for any unmatched route across the entire app.
 * Next.js uses this as the fallback 404 — must be at app/not-found.tsx.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        {/* Error code */}
        <p className="text-8xl font-bold text-primary/20 select-none">404</p>

        <h1 className="mt-4 text-2xl font-bold text-text-primary">
          Page not found
        </h1>
        <p className="mt-2 text-text-secondary">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-text-primary hover:bg-surface transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
