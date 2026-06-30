import { afterEach, describe, expect, it } from "vitest";
import { resolveEnv, requireEnv } from "./env";

describe("resolveEnv", () => {
  afterEach(() => {
    delete process.env.DATABASE_URL;
    delete process.env.stm_DATABASE_URL;
    delete process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.stm_READ_WRITE_TOKEN;
  });

  it("prefers direct name", () => {
    process.env.DATABASE_URL = "postgres://direct";
    process.env.stm_DATABASE_URL = "postgres://prefixed";
    expect(resolveEnv("DATABASE_URL")).toBe("postgres://direct");
  });

  it("falls back to store-prefixed integration vars", () => {
    process.env.stm_DATABASE_URL = "postgres://prefixed";
    expect(resolveEnv("DATABASE_URL", "POSTGRES_URL")).toBe("postgres://prefixed");
  });

  it("resolves blob token alias", () => {
    process.env.stm_READ_WRITE_TOKEN = "blob-token";
    expect(resolveEnv("BLOB_READ_WRITE_TOKEN", "READ_WRITE_TOKEN")).toBe("blob-token");
  });

  it("requireEnv throws when missing", () => {
    expect(() => requireEnv("DATABASE_URL")).toThrow("DATABASE_URL is not configured");
  });
});
