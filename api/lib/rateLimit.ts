import { resolveEnv } from "./env.js";

type Bucket = { count: number; resetAt: number };

const memoryStore = new Map<string, Bucket>();

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSec: number };

function getLimits() {
  const testMode = process.env.RATE_LIMIT_TEST === "1";
  return {
    checkout: { limit: testMode ? 3 : 10, windowMs: testMode ? 60_000 : 10 * 60_000 },
    authFail: { limit: testMode ? 2 : 5, windowMs: testMode ? 60_000 : 15 * 60_000 },
    proof: { limit: testMode ? 5 : 10, windowMs: testMode ? 60_000 : 10 * 60_000 },
  };
}

async function checkRedis(key: string, limit: number, windowMs: number): Promise<RateLimitResult | null> {
  const url = resolveEnv("UPSTASH_REDIS_REST_URL");
  const token = resolveEnv("UPSTASH_REDIS_REST_TOKEN");
  if (!url || !token) return null;

  try {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({ url, token });
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      prefix: "ecommerce-template",
    });
    const result = await ratelimit.limit(key);
    if (result.success) return { allowed: true };
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
    };
  } catch (err) {
    console.error("rate_limit_redis_error", err);
    return null;
  }
}

function checkMemory(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = memoryStore.get(key);

  if (!bucket || now >= bucket.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { allowed: true };
}

export async function rateLimit(
  key: string,
  kind: keyof ReturnType<typeof getLimits>,
): Promise<RateLimitResult> {
  const { limit, windowMs } = getLimits()[kind];
  const redisResult = await checkRedis(key, limit, windowMs);
  if (redisResult) return redisResult;
  return checkMemory(key, limit, windowMs);
}

export function rateLimitKey(prefix: string, ip: string, suffix?: string): string {
  return suffix ? `${prefix}:${ip}:${suffix}` : `${prefix}:${ip}`;
}
