import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/db";
import { limiters } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("A valid email is required"),
});

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * POST /api/auth/forgot-password
 *
 * Always returns a generic success message regardless of whether the email
 * exists, to avoid leaking which addresses are registered (user enumeration).
 * The raw token is only ever emailed to the user — only its SHA-256 hash is
 * stored, the same defense-in-depth pattern used for session/API secrets.
 */
export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      request.headers.get("x-real-ip") ??
      "anonymous";

    const limit = limiters.passwordReset(ip);

    if (!limit.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = result.data;
    const genericResponse = NextResponse.json({
      success: true,
      message: "If an account exists for that email, a reset link has been sent.",
    });

    const user = await prisma.user.findUnique({ where: { email } });

    // Don't reveal whether the account exists, and OAuth-only accounts have
    // no password to reset — both cases return the same generic response.
    if (!user || !user.password) {
      return genericResponse;
    }

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    await prisma.passwordResetToken.create({
      data: {
        email,
        tokenHash,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(email, resetUrl);

    return genericResponse;
  } catch (error) {
    console.error("[FORGOT_PASSWORD_POST]", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
