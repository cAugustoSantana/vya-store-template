/**
 * @vitest-environment node
 */
import { describe, it, expect } from "vitest";
import { rateLimit, rateLimitKey } from "./rateLimit";

describe("rateLimit memory store", () => {
  it("blocks after limit exceeded", async () => {
    const key = rateLimitKey("test", "127.0.0.1", "unit");
    process.env.RATE_LIMIT_TEST = "1";

    const first = await rateLimit(key, "checkout");
    const second = await rateLimit(key, "checkout");
    const third = await rateLimit(key, "checkout");
    const fourth = await rateLimit(key, "checkout");

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(true);
    expect(fourth.allowed).toBe(false);
    if (!fourth.allowed) {
      expect(fourth.retryAfterSec).toBeGreaterThan(0);
    }
  });
});
