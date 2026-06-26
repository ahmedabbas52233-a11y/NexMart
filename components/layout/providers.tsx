"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

/**
 * Providers Component
 * 
 * WHY: Centralizes all React context providers in one place.
 * NextAuth SessionProvider must be client-side (uses React context).
 * Sonner Toaster provides toast notifications globally.
 * 
 * Kept as a separate component to keep layout.tsx server-side
 * where possible for better performance.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster 
        position="top-right" 
        richColors 
        closeButton
        toastOptions={{
          style: {
            fontSize: "14px",
          },
        }}
      />
    </SessionProvider>
  );
}
