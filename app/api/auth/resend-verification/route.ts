import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { limiters } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email";

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * POST /api/auth/resend-verification
 *
 * Requires an active session (unlike forgot-password, this isn't a public
 * enumeration surface — you have to already be signed in as the account
 * in question), so it doesn't need the same "always return generic
 * success" treatment. Still rate-limited to prevent spamming an inbox.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      request.headers.get("x-real-ip") ??
      "anonymous";

    const limit = await limiters.passwordReset(ip); // reuse the same conservative limit

    if (!limit.success) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Account not found" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json({ success: true, message: "Email is already verified" });
    }

    const token = randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
      },
    });

    const verifyUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/verify-email?token=${token}`;
    await sendVerificationEmail(user.email, verifyUrl);

    return NextResponse.json({ success: true, message: "Verification email sent" });
  } catch (error) {
    console.error("[RESEND_VERIFICATION_POST]", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
