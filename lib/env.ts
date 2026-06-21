import { z } from "zod";

/**
 * Environment Variable Validation
 *
 * WHY: Missing or malformed env vars are a top cause of silent prod failures.
 * Zod validates every required var at startup — the app crashes immediately
 * with a clear error message instead of a cryptic DB timeout 30 minutes later.
 *
 * Pattern: validate server-side vars separately from public client vars.
 * Never expose server secrets to the browser bundle.
 */

const serverEnvSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .startsWith("postgresql", "DATABASE_URL must be a PostgreSQL connection string"),

  // NextAuth
  NEXTAUTH_URL: z
    .string()
    .url("NEXTAUTH_URL must be a valid URL"),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters"),

  // OAuth (optional — omit to disable Google sign-in)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Seed credentials (optional — only needed for `npm run db:seed`)
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),

  // Runtime environment
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

/**
 * Validates and exports typed environment variables.
 *
 * In CI/test mode (SKIP_ENV_VALIDATION=1), validation is skipped so the
 * build doesn't require a real database connection.
 */
function validateEnv() {
  // Allow skipping during CI builds (no real DB available)
  if (process.env.SKIP_ENV_VALIDATION === "1") {
    return process.env as unknown as z.infer<typeof serverEnvSchema>;
  }

  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  ✗ ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `\n\n❌ Invalid environment variables:\n${formatted}\n\n` +
        `See .env.example for required variables.\n`
    );
  }

  return result.data;
}

export const env = validateEnv();

export type Env = z.infer<typeof serverEnvSchema>;
