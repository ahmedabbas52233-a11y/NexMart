import { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { limiters } from "@/lib/rate-limit";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials, req) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      // Rate limit by IP before touching the database — the login limiter
      // was previously defined and tested but never actually called,
      // leaving credential brute-forcing completely unthrottled.
      const ip =
        req?.headers?.["x-forwarded-for"]?.split(",")[0].trim() ??
        req?.headers?.["x-real-ip"] ??
        "anonymous";

      const limit = await limiters.login(ip);

      if (!limit.success) {
        throw new Error("Too many login attempts. Please try again later.");
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (!user || !user.password) {
        return null;
      }

      const isValid = await bcrypt.compare(credentials.password, user.password);

      if (!isValid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
        emailVerified: user.emailVerified,
      };
    },
  }),
];

// Google sign-in is only offered when credentials are configured —
// keeps the "Continue with Google" button honest instead of failing at runtime.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

/**
 * NextAuth Configuration
 * 
 * WHY NextAuth over custom JWT:
 * 1. Handles session management, CSRF protection, and OAuth out of the box
 * 2. Prisma Adapter persists sessions in database (secure, scalable)
 * 3. Credentials provider allows email/password login alongside OAuth
 * 4. Role-based access control via session callback
 * 
 * SECURITY NOTES:
 * - Passwords are hashed with bcrypt (12 rounds) before storage
 * - Session strategy is JWT (stateless) — the Prisma adapter is only used to
 *   persist User/Account records so Google OAuth can link to existing accounts
 * - The JWT is signed with NEXTAUTH_SECRET
 * - CSRF tokens are automatically managed by NextAuth
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt", // JWT strategy for stateless sessions
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.emailVerified = user.emailVerified ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "ADMIN";
        // NOTE: since this is a JWT (stateless) session, this reflects
        // verification status as of last sign-in, not live — a user who
        // verifies their email without signing out won't see the banner
        // clear until their next login. Acceptable for a non-blocking,
        // informational indicator; would need a DB session strategy (or a
        // dedicated status-check call) to be fully real-time.
        session.user.emailVerified = (token.emailVerified as Date | null) ?? null;
      }
      return session;
    },
  },
};
