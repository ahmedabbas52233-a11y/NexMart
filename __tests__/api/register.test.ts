import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

// Define mocks with explicit types BEFORE importing route
const mockFindUnique = vi.fn();
const mockCreate = vi.fn();

const mockPrisma = {
  user: {
    findUnique: mockFindUnique as Mock,
    create: mockCreate as Mock,
  },
};

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("bcryptjs", () => ({
  hash: vi.fn(() => Promise.resolve("hashed-password")),
}));

import { POST } from "@/app/api/auth/register/route";
import bcrypt from "bcryptjs";

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new user", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
    });

    const req = {
      json: async () => ({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      }),
    };

    const res = await POST(req as any);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.message).toBe("User created successfully");
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 12);
  });

  it("returns 409 when email already exists", async () => {
    mockFindUnique.mockResolvedValue({
      id: "existing",
      email: "test@example.com",
    });

    const req = {
      json: async () => ({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      }),
    };

    const res = await POST(req as any);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error).toBe("Email already registered");
  });
});