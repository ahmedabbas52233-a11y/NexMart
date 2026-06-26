import "@testing-library/jest-dom";
import { vi } from "vitest";
import React from "react";

// ─── Next.js navigation ──────────────────────────────────────────────────────
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// ─── Next.js Image — render a plain <img> so assertions still work ────────────
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    fill,
    ...rest
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    [key: string]: unknown;
  }) => React.createElement("img", { src, alt, ...rest }),
}));

// ─── Next.js Link — render a plain <a> ───────────────────────────────────────
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement("a", { href, ...rest }, children),
}));

// ─── Sonner toast ─────────────────────────────────────────────────────────────
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
  Toaster: () => null,
}));

// ─── next-auth/react session (client-side) ────────────────────────────────────
vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({ data: null, status: "unauthenticated" })),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));
