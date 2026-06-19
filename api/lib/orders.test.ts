import { describe, it, expect } from "vitest";
import { buildDisplayId } from "./orders";

describe("buildDisplayId", () => {
  it("formats storeSlug-last5", () => {
    expect(buildDisplayId("550e8400-e29b-41d4-a716-446655440000")).toBe("MITIENDA-40000");
  });
});
