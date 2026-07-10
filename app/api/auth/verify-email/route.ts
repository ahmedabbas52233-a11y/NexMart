import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const verifySchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

/**
 * POST /api/auth/verify-email
 *
 * Consumes a verification token (NextAuth's VerificationToken table,
 * repurposed here — it's otherwise unused since no Email/magic-link
 * provider is configured), marks the matching user's email as verified,
 * and deletes the token (single-use).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = verifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { token } = result.data;

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      return NextResponse.json(
        { success: false, error: "This verification link is invalid or has expired" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "This verification link is invalid or has expired" },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.delete({
        where: { token },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("[VERIFY_EMAIL_POST]", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
