"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

/**
 * Global error boundary — catches errors anywhere in the app tree
 * that aren't handled by a more specific error.tsx (e.g. products/error.tsx).
 */
export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8 text-danger" />
        </div>
        <h2 className="text-heading-2 text-text-primary mb-2">Something went wrong</h2>
        <p className="text-text-secondary mb-6 max-w-md">
          An unexpected error occurred. Please try again, or head back to the homepage.
        </p>
        <div className="flex gap-3">
          <Button onClick={reset} variant="primary">
            Try Again
          </Button>
          <Button onClick={() => (window.location.href = "/")} variant="secondary">
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
