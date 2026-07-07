/**
 * In-Memory Rate Limiter
 *
 * WHY: Auth endpoints (/register, /login) are the most abused in any web app.
 * Without rate limiting:
 *   - /register → spammers create thousands of accounts
 *   - /login (via NextAuth) → brute-force attacks on passwords
 *
 * WHY in-memory (not Redis/Upstash):
 *   - Zero additional services or cost for a portfolio/demo deployment
 *   - Works correctly on Vercel's single-instance Edge Functions
 *   - For multi-instance production at scale, swap Map → @upstash/ratelimit
 *
 * Algorithm: Token bucket (sliding window approximation)
 * Each IP gets `maxRequests` tokens per `windowMs`. Consumed on each request.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (entry.resetAt < now) store.delete(key);
  });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Max requests per IP per window */
  maxRequests: number;
  /** Key prefix to namespace different limiters */
  prefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  /** Requests remaining in the current window */
  remaining: number;
  /** Epoch ms when the window resets */
  resetAt: number;
  /** Total requests allowed per window */
  limit: number;
}

/**
 * Check if a request from `identifier` (typically IP address) is within limits.
 *
 * @example
 * const result = rateLimit(ip, { windowMs: 60_000, maxRequests: 5, prefix: 'register' })
 * if (!result.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
 */
export function rateLimit(
  identifier: string,
  { windowMs, maxRequests, prefix = "default" }: RateLimitConfig
): RateLimitResult {
  const key = `${prefix}:${identifier}`;
  const now = Date.now();

  const entry = store.get(key);

  // New window or expired window — reset counter
  if (!entry || entry.resetAt < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    };
    store.set(key, newEntry);
    return {
      success: true,
      remaining: maxRequests - 1,
      resetAt: newEntry.resetAt,
      limit: maxRequests,
    };
  }

  // Existing window — increment counter
  entry.count += 1;

  return {
    success: entry.count <= maxRequests,
    remaining: Math.max(0, maxRequests - entry.count),
    resetAt: entry.resetAt,
    limit: maxRequests,
  };
}

/**
 * Pre-configured limiters for common use cases.
 */
export const limiters = {
  /** 5 registrations per IP per 15 minutes */
  register: (ip: string) =>
    rateLimit(ip, { windowMs: 15 * 60 * 1000, maxRequests: 5, prefix: "reg" }),

  /** 10 login attempts per IP per 15 minutes */
  login: (ip: string) =>
    rateLimit(ip, { windowMs: 15 * 60 * 1000, maxRequests: 10, prefix: "login" }),

  /** 5 password reset requests per IP per 15 minutes */
  passwordReset: (ip: string) =>
    rateLimit(ip, { windowMs: 15 * 60 * 1000, maxRequests: 5, prefix: "pwreset" }),

  /** 30 API reads per IP per minute */
  api: (ip: string) =>
    rateLimit(ip, { windowMs: 60 * 1000, maxRequests: 30, prefix: "api" }),
} as const;
