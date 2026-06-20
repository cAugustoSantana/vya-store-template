import { describe, expect, it } from "vitest";
import {
  draftsToVariantOptions,
  validateVariantDrafts,
  variantOptionsToDrafts,
} from "./variantOptions";

describe("variantOptions", () => {
  it("round-trips variant options through drafts", () => {
    const original = {
      size: {
        label: { es: "Talla", en: "Size" },
        values: {
          m: { es: "M", en: "M" },
          l: { es: "L", en: "L" },
        },
      },
    };

    const drafts = variantOptionsToDrafts(original);
    expect(drafts).toHaveLength(1);
    expect(drafts[0]?.groupKey).toBe("size");

    const rebuilt = draftsToVariantOptions(drafts);
    expect(rebuilt).toEqual(original);
  });

  it("skips empty groups and values", () => {
    const drafts = [
      {
        id: "1",
        groupKey: "color",
        labelEs: "Color",
        labelEn: "Color",
        values: [
          { id: "v1", valueKey: "black", labelEs: "Negro", labelEn: "Black" },
          { id: "v2", valueKey: "", labelEs: "", labelEn: "" },
        ],
      },
      {
        id: "2",
        groupKey: "",
        labelEs: "",
        labelEn: "",
        values: [{ id: "v3", valueKey: "x", labelEs: "X", labelEn: "X" }],
      },
    ];

    expect(draftsToVariantOptions(drafts)).toEqual({
      color: {
        label: { es: "Color", en: "Color" },
        values: { black: { es: "Negro", en: "Black" } },
      },
    });
  });

  it("validates duplicate group keys", () => {
    const error = validateVariantDrafts([
      {
        id: "1",
        groupKey: "size",
        labelEs: "Talla",
        labelEn: "Size",
        values: [{ id: "v1", valueKey: "m", labelEs: "M", labelEn: "M" }],
      },
      {
        id: "2",
        groupKey: "size",
        labelEs: "Talla",
        labelEn: "Size",
        values: [{ id: "v2", valueKey: "l", labelEs: "L", labelEn: "L" }],
      },
    ]);
    expect(error).toBe("variant_group_key_duplicate");
  });
});
