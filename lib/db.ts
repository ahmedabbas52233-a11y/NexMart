import { PrismaClient } from "@prisma/client";
// Validate all required env vars at startup — fails fast with a clear error
// instead of a cryptic Prisma "database URL not found" crash later.
import "@/lib/env";

/**
 * Prisma Client Singleton Pattern
 * 
 * WHY: In development, hot reloading creates multiple PrismaClient instances,
 * exhausting database connections. This pattern ensures a single instance.
 * 
 * In production, Next.js handles this automatically, but the singleton
 * pattern is still best practice for consistency.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
