/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeAll } from "vitest";

describe("admin JWT", () => {
  beforeAll(() => {
    process.env.ADMIN_SECRET = "test-secret-at-least-32-characters-long";
  });

  it("signs and verifies token", async () => {
    const { signAdminToken, verifyAdminToken } = await import("./auth");
    const token = await signAdminToken();
    const payload = await verifyAdminToken(token);
    expect(payload.role).toBe("admin");
  });

  it("rejects token signed with wrong secret", async () => {
    const { SignJWT } = await import("jose");
    const badToken = await new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("8h")
      .sign(new TextEncoder().encode("wrong-secret-at-least-32-characters-x"));
    const { verifyAdminToken } = await import("./auth");
    await expect(verifyAdminToken(badToken)).rejects.toThrow();
  });
});
