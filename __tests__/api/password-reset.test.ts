import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockRateLimiter = vi.fn();
vi.mock("@/lib/rate-limit", () => ({
  limiters: { passwordReset: (...args: unknown[]) => mockRateLimiter(...args) },
}));

const mockSendPasswordResetEmail = vi.fn();
vi.mock("@/lib/email", () => ({
  sendPasswordResetEmail: (...args: unknown[]) => mockSendPasswordResetEmail(...args),
}));

const mockHash = vi.fn();
vi.mock("bcryptjs", () => ({
  hash: (...args: unknown[]) => mockHash(...args),
}));

const mockPrisma = {
  user: { findUnique: vi.fn(), update: vi.fn() },
  passwordResetToken: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  $transaction: vi.fn(),
};

vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

const { POST: forgotPassword } = await import("@/app/api/auth/forgot-password/route");
const { POST: resetPassword } = await import("@/app/api/auth/reset-password/route");

function makeRequest(url: string, body: unknown) {
  return new NextRequest(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("/api/auth/forgot-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRateLimiter.mockResolvedValue({ success: true });
  });

  it("rejects requests over the rate limit", async () => {
    mockRateLimiter.mockResolvedValue({ success: false });

    const res = await forgotPassword(
      makeRequest("http://localhost/api/auth/forgot-password", { email: "a@b.com" })
    );

    expect(res.status).toBe(429);
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("rejects an invalid email", async () => {
    const res = await forgotPassword(
      makeRequest("http://localhost/api/auth/forgot-password", { email: "not-an-email" })
    );
    expect(res.status).toBe(400);
  });

  it("returns the same generic response for a nonexistent email (no user enumeration)", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const res = await forgotPassword(
      makeRequest("http://localhost/api/auth/forgot-password", { email: "nobody@example.com" })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("returns the same generic response for an OAuth-only account (no password set)", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "u1", email: "oauth@example.com", password: null });

    const res = await forgotPassword(
      makeRequest("http://localhost/api/auth/forgot-password", { email: "oauth@example.com" })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("creates a hashed token and sends the reset email for a real account", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "u1", email: "real@example.com", password: "hashed" });
    mockPrisma.passwordResetToken.create.mockResolvedValue({});

    const res = await forgotPassword(
      makeRequest("http://localhost/api/auth/forgot-password", { email: "real@example.com" })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockPrisma.passwordResetToken.create).toHaveBeenCalled();

    // The raw token must never be stored — only its hash.
    const createCall = mockPrisma.passwordResetToken.create.mock.calls[0][0];
    expect(createCall.data.tokenHash).toBeDefined();
    expect(createCall.data.tokenHash).toHaveLength(64); // sha256 hex digest length
    expect(createCall.data.email).toBe("real@example.com");

    expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
      "real@example.com",
      expect.stringContaining("/auth/reset-password?token=")
    );
  });
});

describe("/api/auth/reset-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHash.mockResolvedValue("new-hashed-password");
  });

  it("rejects a password shorter than 8 characters", async () => {
    const res = await resetPassword(
      makeRequest("http://localhost/api/auth/reset-password", { token: "abc", password: "short" })
    );
    expect(res.status).toBe(400);
  });

  it("rejects a token that doesn't exist", async () => {
    mockPrisma.passwordResetToken.findUnique.mockResolvedValue(null);

    const res = await resetPassword(
      makeRequest("http://localhost/api/auth/reset-password", { token: "bogus", password: "newpassword123" })
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/invalid or has expired/i);
  });

  it("rejects an already-used token", async () => {
    mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
      email: "a@b.com",
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
    });

    const res = await resetPassword(
      makeRequest("http://localhost/api/auth/reset-password", { token: "used-token", password: "newpassword123" })
    );

    expect(res.status).toBe(400);
  });

  it("rejects an expired token", async () => {
    mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
      email: "a@b.com",
      usedAt: null,
      expiresAt: new Date(Date.now() - 60_000), // expired 1 minute ago
    });

    const res = await resetPassword(
      makeRequest("http://localhost/api/auth/reset-password", { token: "expired-token", password: "newpassword123" })
    );

    expect(res.status).toBe(400);
  });

  it("updates the password and marks the token used for a valid token", async () => {
    mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
      email: "real@example.com",
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    });
    mockPrisma.user.findUnique.mockResolvedValue({ id: "u1", email: "real@example.com" });
    mockPrisma.user.update.mockResolvedValue({});
    mockPrisma.passwordResetToken.update.mockResolvedValue({});
    mockPrisma.$transaction.mockResolvedValue([{}, {}]);

    const res = await resetPassword(
      makeRequest("http://localhost/api/auth/reset-password", { token: "valid-token", password: "newpassword123" })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockHash).toHaveBeenCalledWith("newpassword123", 12);
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });
});
