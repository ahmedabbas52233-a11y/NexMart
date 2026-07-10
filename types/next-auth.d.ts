import { DefaultSession } from "next-auth";

/**
 * NextAuth Type Augmentation
 * 
 * WHY: NextAuth's default types don't include custom fields like `role` and `id`.
 * This module augmentation extends the types so TypeScript knows about them
 * throughout the app (in session callbacks, middleware, client components).
 * 
 * Without this, you'd get TypeScript errors when accessing session.user.role
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
      emailVerified: Date | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: "USER" | "ADMIN";
    emailVerified?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "USER" | "ADMIN";
    id?: string;
    emailVerified?: Date | null;
  }
}
