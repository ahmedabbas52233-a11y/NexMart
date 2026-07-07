import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetToken = vi.fn();

vi.mock("next-auth/jwt", () => ({
  getToken: (...args: unknown[]) => mockGetToken(...args),
}));

const { middleware } = await import("@/middleware");

function makeRequest(path: string) {
  return new NextRequest(new URL(path, "http://localhost"));
}

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("admin route protection", () => {
    it("redirects unauthenticated users away from /admin to sign-in", async () => {
      mockGetToken.mockResolvedValue(null);

      const res = await middleware(makeRequest("/admin"));

      expect(res.status).toBe(307);
      const location = res.headers.get("location");
      expect(location).toContain("/auth/signin");
      expect(location).toContain("callbackUrl");
    });

    it("redirects authenticated non-admins away from /admin", async () => {
      mockGetToken.mockResolvedValue({ role: "USER" });

      const res = await middleware(makeRequest("/admin/products"));

      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe("http://localhost/");
    });

    it("allows admins through to /admin routes", async () => {
      mockGetToken.mockResolvedValue({ role: "ADMIN" });

      const res = await middleware(makeRequest("/admin/products"));

      // NextResponse.next() carries no redirect status
      expect(res.headers.get("location")).toBeNull();
    });

    it("does not check tokens for non-admin routes", async () => {
      const res = await middleware(makeRequest("/products"));

      expect(mockGetToken).not.toHaveBeenCalled();
      expect(res.headers.get("location")).toBeNull();
    });
  });

  describe("security headers", () => {
    it("sets security headers on every response", async () => {
      const res = await middleware(makeRequest("/"));

      expect(res.headers.get("X-Frame-Options")).toBe("DENY");
      expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(res.headers.get("Content-Security-Policy")).toContain("default-src 'self'");
    });
  });
});
