import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindUnique = vi.fn();
const mockLoginLimiter = vi.fn();
const mockCompare = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: { user: { findUnique: (...args: unknown[]) => mockFindUnique(...args) } },
}));

vi.mock("@/lib/rate-limit", () => ({
  limiters: { login: (...args: unknown[]) => mockLoginLimiter(...args) },
}));

vi.mock("bcryptjs", () => ({
  default: { compare: (...args: unknown[]) => mockCompare(...args) },
}));

vi.mock("@auth/prisma-adapter", () => ({
  PrismaAdapter: () => ({}),
}));

const { authOptions } = await import("@/lib/auth");

function getAuthorize() {
  const credentialsProvider = authOptions.providers.find(
    (p) => p.id === "credentials"
  ) as unknown as { options: { authorize: (creds: unknown, req: unknown) => Promise<unknown> } };
  return credentialsProvider.options.authorize;
}

describe("credentials authorize (lib/auth.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoginLimiter.mockReturnValue({ success: true });
  });

  it("returns null when credentials are missing", async () => {
    const authorize = getAuthorize();
    const result = await authorize({}, { headers: {} });
    expect(result).toBeNull();
    // Rate limiter shouldn't even be consulted for a malformed request
    expect(mockLoginLimiter).not.toHaveBeenCalled();
  });

  it("throws when the login rate limit has been exceeded — this was previously never enforced at all", async () => {
    mockLoginLimiter.mockReturnValue({ success: false });
    const authorize = getAuthorize();

    await expect(
      authorize({ email: "a@b.com", password: "x" }, { headers: {} })
    ).rejects.toThrow(/too many/i);

    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("returns null when the user doesn't exist", async () => {
    mockFindUnique.mockResolvedValue(null);
    const authorize = getAuthorize();

    const result = await authorize({ email: "a@b.com", password: "x" }, { headers: {} });
    expect(result).toBeNull();
  });

  it("returns null when the password is wrong", async () => {
    mockFindUnique.mockResolvedValue({ id: "u1", email: "a@b.com", password: "hashed" });
    mockCompare.mockResolvedValue(false);
    const authorize = getAuthorize();

    const result = await authorize({ email: "a@b.com", password: "wrong" }, { headers: {} });
    expect(result).toBeNull();
  });

  it("returns the user when credentials are valid and under the rate limit", async () => {
    mockFindUnique.mockResolvedValue({
      id: "u1",
      email: "a@b.com",
      name: "Jane",
      image: null,
      role: "USER",
      password: "hashed",
    });
    mockCompare.mockResolvedValue(true);
    const authorize = getAuthorize();

    const result = await authorize({ email: "a@b.com", password: "correct" }, { headers: {} });
    expect(result).toMatchObject({ id: "u1", email: "a@b.com", role: "USER" });
  });

  it("extracts the client IP from x-forwarded-for for rate limiting", async () => {
    mockFindUnique.mockResolvedValue(null);
    const authorize = getAuthorize();

    await authorize(
      { email: "a@b.com", password: "x" },
      { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } }
    );

    expect(mockLoginLimiter).toHaveBeenCalledWith("1.2.3.4");
  });
});
