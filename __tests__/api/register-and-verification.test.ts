import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockRegisterLimiter = vi.fn();
const mockPasswordResetLimiter = vi.fn();
vi.mock("@/lib/rate-limit", () => ({
  limiters: {
    register: (...args: unknown[]) => mockRegisterLimiter(...args),
    passwordReset: (...args: unknown[]) => mockPasswordResetLimiter(...args),
  },
}));

const mockSendVerificationEmail = vi.fn();
vi.mock("@/lib/email", () => ({
  sendVerificationEmail: (...args: unknown[]) => mockSendVerificationEmail(...args),
}));

const mockBcryptHash = vi.fn();
vi.mock("bcryptjs", () => ({
  default: { hash: (...args: unknown[]) => mockBcryptHash(...args) },
}));

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

const mockPrisma = {
  user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  verificationToken: { create: vi.fn(), findUnique: vi.fn(), delete: vi.fn() },
  $transaction: vi.fn(),
};
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

function makeRequest(url: string, body?: unknown) {
  return new NextRequest(url, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
    headers: { "Content-Type": "application/json" },
  });
}

const { POST: register } = await import("@/app/api/auth/register/route");
const { POST: verifyEmail } = await import("@/app/api/auth/verify-email/route");
const { POST: resendVerification } = await import("@/app/api/auth/resend-verification/route");

describe("/api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegisterLimiter.mockResolvedValue({ success: true, limit: 5, remaining: 4, resetAt: Date.now() + 1000 });
    mockBcryptHash.mockResolvedValue("hashed-password");
  });

  it("rejects requests over the rate limit", async () => {
    mockRegisterLimiter.mockResolvedValue({ success: false, limit: 5, remaining: 0, resetAt: Date.now() + 1000 });

    const res = await register(
      makeRequest("http://localhost/api/auth/register", { name: "Jane", email: "jane@example.com", password: "password123" })
    );
    expect(res.status).toBe(429);
  });

  it("rejects invalid input", async () => {
    const res = await register(
      makeRequest("http://localhost/api/auth/register", { name: "J", email: "not-an-email", password: "short" })
    );
    expect(res.status).toBe(400);
  });

  it("rejects a duplicate email", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "existing" });

    const res = await register(
      makeRequest("http://localhost/api/auth/register", { name: "Jane", email: "jane@example.com", password: "password123" })
    );
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error).toMatch(/already registered/i);
  });

  it("creates the account, hashes the password, and sends a verification email", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: "u1",
      name: "Jane",
      email: "jane@example.com",
      role: "USER",
      createdAt: new Date(),
    });
    mockPrisma.verificationToken.create.mockResolvedValue({});

    const res = await register(
      makeRequest("http://localhost/api/auth/register", { name: "Jane", email: "jane@example.com", password: "password123" })
    );
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.data.email).toBe("jane@example.com");
    expect(data.data.password).toBeUndefined(); // never returned
    expect(mockBcryptHash).toHaveBeenCalledWith("password123", 12);
    expect(mockPrisma.verificationToken.create).toHaveBeenCalled();
    expect(mockSendVerificationEmail).toHaveBeenCalledWith(
      "jane@example.com",
      expect.stringContaining("/auth/verify-email?token=")
    );
  });

  it("still returns success even if sending the verification email fails", async () => {
    // Registration must not fail just because a best-effort email didn't send.
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: "u1",
      name: "Jane",
      email: "jane@example.com",
      role: "USER",
      createdAt: new Date(),
    });
    mockPrisma.verificationToken.create.mockRejectedValue(new Error("DB hiccup"));

    const res = await register(
      makeRequest("http://localhost/api/auth/register", { name: "Jane", email: "jane@example.com", password: "password123" })
    );

    expect(res.status).toBe(201);
  });
});

describe("/api/auth/verify-email", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("rejects a token that doesn't exist", async () => {
    mockPrisma.verificationToken.findUnique.mockResolvedValue(null);

    const res = await verifyEmail(makeRequest("http://localhost/api/auth/verify-email", { token: "bogus" }));
    expect(res.status).toBe(400);
  });

  it("rejects an expired token", async () => {
    mockPrisma.verificationToken.findUnique.mockResolvedValue({
      identifier: "jane@example.com",
      token: "expired",
      expires: new Date(Date.now() - 1000),
    });

    const res = await verifyEmail(makeRequest("http://localhost/api/auth/verify-email", { token: "expired" }));
    expect(res.status).toBe(400);
  });

  it("marks the email verified and deletes the token for a valid token", async () => {
    mockPrisma.verificationToken.findUnique.mockResolvedValue({
      identifier: "jane@example.com",
      token: "valid",
      expires: new Date(Date.now() + 1000),
    });
    mockPrisma.user.findUnique.mockResolvedValue({ id: "u1", email: "jane@example.com" });
    mockPrisma.user.update.mockResolvedValue({});
    mockPrisma.verificationToken.delete.mockResolvedValue({});
    mockPrisma.$transaction.mockResolvedValue([{}, {}]);

    const res = await verifyEmail(makeRequest("http://localhost/api/auth/verify-email", { token: "valid" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });
});

describe("/api/auth/resend-verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPasswordResetLimiter.mockResolvedValue({ success: true, limit: 5, remaining: 4, resetAt: Date.now() + 1000 });
  });

  it("requires an active session", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await resendVerification(makeRequest("http://localhost/api/auth/resend-verification"));
    expect(res.status).toBe(401);
  });

  it("is rate limited", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "u1", email: "jane@example.com" } });
    mockPasswordResetLimiter.mockResolvedValue({ success: false, limit: 5, remaining: 0, resetAt: Date.now() });

    const res = await resendVerification(makeRequest("http://localhost/api/auth/resend-verification"));
    expect(res.status).toBe(429);
  });

  it("returns early if already verified without sending another email", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "u1", email: "jane@example.com" } });
    mockPrisma.user.findUnique.mockResolvedValue({ id: "u1", email: "jane@example.com", emailVerified: new Date() });

    const res = await resendVerification(makeRequest("http://localhost/api/auth/resend-verification"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toMatch(/already verified/i);
    expect(mockSendVerificationEmail).not.toHaveBeenCalled();
  });

  it("sends a new verification email for an unverified account", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "u1", email: "jane@example.com" } });
    mockPrisma.user.findUnique.mockResolvedValue({ id: "u1", email: "jane@example.com", emailVerified: null });
    mockPrisma.verificationToken.create.mockResolvedValue({});

    const res = await resendVerification(makeRequest("http://localhost/api/auth/resend-verification"));

    expect(res.status).toBe(200);
    expect(mockSendVerificationEmail).toHaveBeenCalled();
  });
});
