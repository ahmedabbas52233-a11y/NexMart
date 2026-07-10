import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate Limiter
 *
 * WHY THIS MATTERS ON VERCEL SPECIFICALLY: Vercel serverless functions are
 * NOT single-instance. Under real traffic, Vercel runs multiple concurrent
 * instances of the same function, each with its own separate process memory.
 * A plain in-memory Map does not share state across them — so "10 attempts
 * per 15 minutes" using only a Map is actually closer to "10 attempts per
 * warm instance, and there may be several at once," and a cold start wipes
 * it entirely. That's not a rate limiter you can trust for anything that
 * actually matters (auth brute-forcing, password reset abuse).
 *
 * WHEN CONFIGURED (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN set):
 * uses Upstash Redis via @upstash/ratelimit — a real external store shared
 * across every instance, which is what makes the limit actually hold under
 * horizontal scaling. Upstash has a free tier sufficient for a portfolio
 * project: https://upstash.com
 *
 * WHEN NOT CONFIGURED: falls back to the in-memory Map so the app still
 * runs and rate limiting still works *locally* (single dev server process),
 * but this fallback provides materially weaker protection on serverless —
 * that tradeoff is deliberate and documented here, not hidden.
 */

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = UPSTASH_URL && UPSTASH_TOKEN
  ? new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN })
  : null;

if (!redis && process.env.NODE_ENV === "production") {
  console.warn(
    "⚠️  UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — rate limiting is " +
    "using in-memory storage, which does not reliably enforce limits across Vercel's " +
    "multiple serverless instances. Set both env vars for real protection in production."
  );
}

export interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Max requests per identifier per window */
  maxRequests: number;
  /** Key prefix to namespace different limiters */
  prefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

// ─── In-memory fallback (token bucket, sliding-window approximation) ───────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  memoryStore.forEach((entry, key) => {
    if (entry.resetAt < now) memoryStore.delete(key);
  });
}, 5 * 60 * 1000);

/**
 * Synchronous in-memory limiter. Exported directly for unit tests and for
 * any caller that doesn't need the Upstash-aware wrapper below.
 */
export function rateLimit(
  identifier: string,
  { windowMs, maxRequests, prefix = "default" }: RateLimitConfig
): RateLimitResult {
  const key = `${prefix}:${identifier}`;
  const now = Date.now();

  const entry = memoryStore.get(key);

  if (!entry || entry.resetAt < now) {
    const newEntry: RateLimitEntry = { count: 1, resetAt: now + windowMs };
    memoryStore.set(key, newEntry);
    return { success: true, remaining: maxRequests - 1, resetAt: newEntry.resetAt, limit: maxRequests };
  }

  entry.count += 1;

  return {
    success: entry.count <= maxRequests,
    remaining: Math.max(0, maxRequests - entry.count),
    resetAt: entry.resetAt,
    limit: maxRequests,
  };
}

// ─── Upstash-backed limiter ─────────────────────────────────────────────────

const upstashLimiters = new Map<string, Ratelimit>();

function getUpstashLimiter(config: RateLimitConfig & { prefix: string }): Ratelimit {
  const key = config.prefix;
  const existing = upstashLimiters.get(key);
  if (existing) return existing;

  const limiter = new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(config.maxRequests, `${Math.ceil(config.windowMs / 1000)} s`),
    prefix: `nexmart:ratelimit:${key}`,
  });
  upstashLimiters.set(key, limiter);
  return limiter;
}

/**
 * Async rate limit check — uses Upstash Redis when configured, otherwise
 * falls back to the in-memory limiter (see module doc comment above for
 * why that fallback is weaker on serverless).
 */
async function checkRateLimit(identifier: string, config: RateLimitConfig): Promise<RateLimitResult> {
  const prefix = config.prefix ?? "default";

  if (redis) {
    const limiter = getUpstashLimiter({ ...config, prefix });
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
      resetAt: result.reset,
      limit: result.limit,
    };
  }

  return rateLimit(identifier, config);
}

/**
 * Pre-configured limiters for common use cases. All return a Promise —
 * `await` them even though the in-memory fallback resolves synchronously,
 * since the Upstash-backed path is a real network call.
 */
export const limiters = {
  /** 5 registrations per IP per 15 minutes */
  register: (ip: string) =>
    checkRateLimit(ip, { windowMs: 15 * 60 * 1000, maxRequests: 5, prefix: "reg" }),

  /** 10 login attempts per IP per 15 minutes */
  login: (ip: string) =>
    checkRateLimit(ip, { windowMs: 15 * 60 * 1000, maxRequests: 10, prefix: "login" }),

  /** 5 password reset requests per IP per 15 minutes */
  passwordReset: (ip: string) =>
    checkRateLimit(ip, { windowMs: 15 * 60 * 1000, maxRequests: 5, prefix: "pwreset" }),

  /** 30 API reads per IP per minute */
  api: (ip: string) =>
    checkRateLimit(ip, { windowMs: 60 * 1000, maxRequests: 30, prefix: "api" }),
} as const;
