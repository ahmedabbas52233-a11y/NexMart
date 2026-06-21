import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { limiters } from "@/lib/rate-limit";
import { z } from "zod";

/**
 * POST /api/auth/register
 *
 * WHY separate from NextAuth:
 * - NextAuth doesn't provide a registration endpoint
 * - We need custom validation (Zod schema)
 * - Can send welcome emails, verification tokens
 * - Prevents duplicate emails with proper error handling
 *
 * SECURITY:
 * - Rate-limited: 5 registrations per IP per 15 minutes
 * - Zod validates all inputs before touching the DB
 * - Password hashed with bcrypt (12 rounds ≈ 250ms — resists brute force)
 * - Response never includes the password hash
 */

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  try {
    // ── Rate limiting ──────────────────────────────────────────────────────
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      request.headers.get("x-real-ip") ??
      "anonymous";

    const limit = limiters.register(ip);

    if (!limit.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(limit.limit),
            "X-RateLimit-Remaining": String(limit.remaining),
            "X-RateLimit-Reset": String(limit.resetAt),
          },
        }
      );
    }

    // ── Input validation ───────────────────────────────────────────────────
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    // ── Duplicate check ────────────────────────────────────────────────────
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 409 }
      );
    }

    // ── Hash password ──────────────────────────────────────────────────────
    // 12 rounds ≈ 250ms: slow enough to resist brute force, fast enough for UX
    const hashedPassword = await bcrypt.hash(password, 12);

    // ── Create user ────────────────────────────────────────────────────────
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
      // Never return the password hash
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error("[REGISTER]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create account" },
      { status: 500 }
    );
  }
}
