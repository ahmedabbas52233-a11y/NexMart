"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("This verification link is missing a token.");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setError(data.error || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setError("Something went wrong. Please try again.");
      });
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <h1 className="text-heading-1 text-text-primary mb-2">Verifying your email...</h1>
          </>
        )}

        {status === "success" && (
          <>
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-heading-1 text-text-primary mb-2">Email Verified!</h1>
            <p className="text-text-secondary mb-6">Thanks for confirming your email address.</p>
            <Link href="/profile">
              <Button>Go to My Account</Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-danger" />
            </div>
            <h1 className="text-heading-1 text-text-primary mb-2">Verification Failed</h1>
            <p className="text-text-secondary mb-6">{error}</p>
            <Link href="/profile">
              <Button variant="secondary">Go to My Account</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
