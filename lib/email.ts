import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "NexMart <onboarding@resend.dev>";

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/**
 * Sends a password reset email via Resend when configured.
 *
 * Without RESEND_API_KEY, this logs the reset link to the server console
 * instead of failing — so password reset is fully testable locally/in a
 * demo without requiring real email credentials, while still being a real,
 * working integration when a key is provided.
 */
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  if (!resend) {
    console.log(`\n📧 [DEV] Password reset link for ${email}:\n${resetUrl}\n`);
    return { success: true, dev: true };
  }

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Reset your NexMart password",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Reset your password</h2>
          <p>We received a request to reset your NexMart password. This link expires in 1 hour.</p>
          <p><a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #0D6EFD; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    return { success: true, dev: false };
  } catch (error) {
    console.error("[SEND_PASSWORD_RESET_EMAIL]", error);
    return { success: false, dev: false };
  }
}

/**
 * Sends an email-ownership verification link. Same fallback pattern as
 * sendPasswordResetEmail — registration succeeds either way, this is a
 * best-effort side effect, not a blocking dependency of signup.
 */
export async function sendVerificationEmail(email: string, verifyUrl: string) {
  if (!resend) {
    console.log(`\n📧 [DEV] Email verification link for ${email}:\n${verifyUrl}\n`);
    return { success: true, dev: true };
  }

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Verify your NexMart email",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Verify your email</h2>
          <p>Welcome to NexMart! Please confirm this is your email address. This link expires in 24 hours.</p>
          <p><a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #0D6EFD; color: white; text-decoration: none; border-radius: 6px;">Verify Email</a></p>
          <p style="color: #666; font-size: 14px;">If you didn't create this account, you can safely ignore this email.</p>
        </div>
      `,
    });
    return { success: true, dev: false };
  } catch (error) {
    console.error("[SEND_VERIFICATION_EMAIL]", error);
    return { success: false, dev: false };
  }
}
