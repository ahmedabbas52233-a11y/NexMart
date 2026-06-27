// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/auth/register/route";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("next/server", () => ({
  NextRequest: class MockNextRequest {
    url: string;
    method: string;
    private _body: string;

    constructor(url: string, init?: { method?: string; body?: string }) {
      this.url = url;
      this.method = (init?.method || "POST").toUpperCase();
      this._body = (init?.body as string) || "{}";
    }

    async json() {
      return JSON.parse(this._body);
    }
  },
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

// Speed up tests — skip real bcrypt hashing (12 rounds ≈ 250ms each)
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password_mock"),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock("@/lib/db", () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  };
  return { prisma: mockPrisma };
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRegisterRequest(body: Record<string, unknown>): any {
  const { NextRequest } = require("next/server");
  return new NextRequest("http://localhost:3000/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

const validBody = {
  name: "Ahmed Abbas",
  email: "ahmed@example.com",
  password: "SecurePass123",
};

const createdUser = {
  id: "user-1",
  name: "Ahmed Abbas",
  email: "ahmed@example.com",
  role: "USER",
  createdAt: new Date().toISOString(),
};

const { prisma: mockPrisma } = await import("@/lib/db");

// ─── Input Validation (Zod) ───────────────────────────────────────────────────
describe("POST /api/auth/register — validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue(createdUser);
  });

  it("returns 400 when name is too short", async () => {
    const req = makeRegisterRequest({ ...validBody, name: "A" });
    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(false);
    expect(data.error).toMatch(/name/i);
    expect(res.status).toBe(400);
  });

  it("returns 400 when email is invalid", async () => {
    const req = makeRegisterRequest({ ...validBody, email: "not-an-email" });
    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(false);
    expect(data.error).toMatch(/email/i);
    expect(res.status).toBe(400);
  });

  it("returns 400 when password is shorter than 8 characters", async () => {
    const req = makeRegisterRequest({ ...validBody, password: "short" });
    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(false);
    expect(data.error).toMatch(/password/i);
    expect(res.status).toBe(400);
  });

  it("returns 400 when required fields are missing", async () => {
    const req = makeRegisterRequest({ email: "ahmed@example.com" });
    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(false);
    expect(res.status).toBe(400);
  });
});

// ─── Duplicate email ──────────────────────────────────────────────────────────
describe("POST /api/auth/register — duplicate email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.user.findUnique.mockResolvedValue({ id: "existing-user", email: validBody.email });
  });

  it("returns 409 when email is already registered", async () => {
    const req = makeRegisterRequest(validBody);
    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(false);
    expect(data.error).toBe("Email already registered");
    expect(res.status).toBe(409);
  });
});

// ─── Successful registration ──────────────────────────────────────────────────
describe("POST /api/auth/register — success", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue(createdUser);
  });

  it("returns 201 with user data on success", async () => {
    const req = makeRegisterRequest(validBody);
    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.data.email).toBe("ahmed@example.com");
    expect(data.data.role).toBe("USER");
    expect(res.status).toBe(201);
  });

  it("does NOT return the password hash in the response", async () => {
    const req = makeRegisterRequest(validBody);
    const res = await POST(req);
    const data = await res.json();

    expect(data.data.password).toBeUndefined();
  });

  it("hashes the password before storing", async () => {
    const bcrypt = await import("bcryptjs");
    const req = makeRegisterRequest(validBody);
    await POST(req);

    expect(bcrypt.default.hash).toHaveBeenCalledWith(validBody.password, 12);
  });

  it("stores the hashed password in Prisma create", async () => {
    const req = makeRegisterRequest(validBody);
    await POST(req);

    const createArg = mockPrisma.user.create.mock.calls[0][0];
    expect(createArg.data.password).toBe("hashed_password_mock");
    expect(createArg.data.email).toBe(validBody.email);
  });

  it("assigns USER role by default", async () => {
    const req = makeRegisterRequest(validBody);
    await POST(req);

    const createArg = mockPrisma.user.create.mock.calls[0][0];
    expect(createArg.data.role).toBe("USER");
  });
});

// ─── Database error ───────────────────────────────────────────────────────────
describe("POST /api/auth/register — database error", () => {
  it("returns 500 when Prisma create throws", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockRejectedValue(new Error("DB connection lost"));

    const req = makeRegisterRequest(validBody);
    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to create account");
    expect(res.status).toBe(500);
  });
});