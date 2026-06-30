import { afterEach, describe, expect, it } from "vitest";
import { getBlobAccess, isBlobAccessMismatchError } from "./blob";

describe("getBlobAccess", () => {
  afterEach(() => {
    delete process.env.BLOB_ACCESS;
  });

  it("defaults to private when BLOB_ACCESS is unset", () => {
    expect(getBlobAccess()).toBe("private");
  });

  it("returns public when BLOB_ACCESS=public", () => {
    process.env.BLOB_ACCESS = "public";
    expect(getBlobAccess()).toBe("public");
  });
});

describe("isBlobAccessMismatchError", () => {
  it("detects private-on-public store mismatch", () => {
    const err = new Error(
      "Vercel Blob: Cannot use private access on a public store. The store must be configured with private access.",
    );
    expect(isBlobAccessMismatchError(err)).toBe(true);
  });

  it("detects public-on-private store mismatch", () => {
    const err = new Error(
      "Vercel Blob: Cannot use public access on a private store. The store must be configured with public access.",
    );
    expect(isBlobAccessMismatchError(err)).toBe(true);
  });

  it("ignores unrelated errors", () => {
    expect(isBlobAccessMismatchError(new Error("network_error"))).toBe(false);
  });
});
