import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { limiters } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(request: NextRequest) {
  try {
    // ── Rate limiting ──────────────────────────────────────────────────────
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      request.headers.get("x-real-ip") ??
      "anonymous";

    const limit = await limiters.register(ip);

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

    // ── Email verification (best-effort — registration still succeeds if
    // this fails; verification is informational, not a gate on sign-in) ──
    try {
      const token = randomBytes(32).toString("hex");
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
        },
      });
      const verifyUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/verify-email?token=${token}`;
      await sendVerificationEmail(email, verifyUrl);
    } catch (error) {
      console.error("[REGISTER_SEND_VERIFICATION]", error);
    }

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error("[REGISTER]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create account" },
      { status: 500 }
    );
  }
}
