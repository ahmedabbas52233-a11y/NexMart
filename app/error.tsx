"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Global Error Boundary
 *
 * WHY: Next.js App Router requires a client-side error boundary to catch
 * errors from Server Components. Without this, unhandled errors show the
 * default browser error screen in production.
 *
 * Placement at app/error.tsx = catches errors in any route segment.
 * Route-specific error.tsx files (e.g. app/(shop)/products/error.tsx)
 * override this for their subtree — more granular control.
 */
interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log to error monitoring service in production
    // e.g. Sentry.captureException(error)
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-danger/20 select-none">500</p>

        <h1 className="mt-4 text-2xl font-bold text-text-primary">
          Something went wrong
        </h1>
        <p className="mt-2 text-text-secondary">
          An unexpected error occurred. The team has been notified.
        </p>

        {/* Error digest for support reference — safe to show, not a stack trace */}
        {error.digest && (
          <p className="mt-2 text-xs text-text-secondary font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-text-primary hover:bg-surface transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
