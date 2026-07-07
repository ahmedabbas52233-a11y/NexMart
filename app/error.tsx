"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

/**
 * Error Boundary for Products Page
 * 
 * WHY: Catches errors in the page component and its children.
 * Prevents the entire app from crashing.
 * Provides a user-friendly error message with retry option.
 */
export default function ProductsError({
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
          We couldn&apos;t load the products. This might be a temporary issue.
        </p>
        <div className="flex gap-3">
          <Button onClick={reset} variant="primary">
            Try Again
          </Button>
          <Button onClick={() => window.location.href = "/"} variant="secondary">
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
