"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The sign-in link is no longer valid.",
  OAuthAccountNotLinked: "This email is already registered with a different sign-in method.",
  Default: "An unexpected error occurred while signing in.",
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("error") ?? "Default";
  const message = errorMessages[code] ?? errorMessages.Default;

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md text-center">
        <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-danger" />
        </div>
        <h1 className="text-heading-1 text-text-primary mb-2">Sign-in Error</h1>
        <p className="text-text-secondary mb-6">{message}</p>
        <div className="flex justify-center gap-3">
          <Link href="/auth/signin">
            <Button variant="primary">Try Again</Button>
          </Link>
          <Link href="/">
            <Button variant="secondary">Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
