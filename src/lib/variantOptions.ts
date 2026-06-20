import type { VariantGroup } from "@shared/product.types";

export type VariantValueDraft = {
  id: string;
  valueKey: string;
  labelEs: string;
  labelEn: string;
};

export type VariantGroupDraft = {
  id: string;
  groupKey: string;
  labelEs: string;
  labelEn: string;
  values: VariantValueDraft[];
};

const KEY_RE = /^[a-z][a-z0-9_-]*$/;

export function createEmptyGroup(): VariantGroupDraft {
  return {
    id: crypto.randomUUID(),
    groupKey: "",
    labelEs: "",
    labelEn: "",
    values: [createEmptyValue()],
  };
}

export function createEmptyValue(): VariantValueDraft {
  return {
    id: crypto.randomUUID(),
    valueKey: "",
    labelEs: "",
    labelEn: "",
  };
}

export function variantOptionsToDrafts(
  variantOptions: Record<string, VariantGroup>,
): VariantGroupDraft[] {
  return Object.entries(variantOptions).map(([groupKey, group]) => ({
    id: crypto.randomUUID(),
    groupKey,
    labelEs: group.label.es,
    labelEn: group.label.en,
    values: Object.entries(group.values).map(([valueKey, labels]) => ({
      id: crypto.randomUUID(),
      valueKey,
      labelEs: labels.es,
      labelEn: labels.en,
    })),
  }));
}

export function draftsToVariantOptions(
  drafts: VariantGroupDraft[],
): Record<string, VariantGroup> {
  const result: Record<string, VariantGroup> = {};

  for (const group of drafts) {
    const groupKey = group.groupKey.trim();
    if (!groupKey) continue;

    const values: Record<string, { es: string; en: string }> = {};
    for (const value of group.values) {
      const valueKey = value.valueKey.trim();
      if (!valueKey) continue;
      values[valueKey] = {
        es: value.labelEs.trim() || valueKey,
        en: value.labelEn.trim() || valueKey,
      };
    }

    if (Object.keys(values).length === 0) continue;

    result[groupKey] = {
      label: {
        es: group.labelEs.trim() || groupKey,
        en: group.labelEn.trim() || groupKey,
      },
      values,
    };
  }

  return result;
}

export function validateVariantDrafts(drafts: VariantGroupDraft[]): string | null {
  const groupKeys = new Set<string>();

  for (const group of drafts) {
    const groupKey = group.groupKey.trim();
    if (!groupKey) {
      return "variant_group_key_required";
    }
    if (!KEY_RE.test(groupKey)) {
      return "variant_group_key_invalid";
    }
    if (groupKeys.has(groupKey)) {
      return "variant_group_key_duplicate";
    }
    groupKeys.add(groupKey);

    const valueKeys = new Set<string>();
    let hasValue = false;

    for (const value of group.values) {
      const valueKey = value.valueKey.trim();
      if (!valueKey) continue;
      hasValue = true;
      if (!KEY_RE.test(valueKey)) {
        return "variant_value_key_invalid";
      }
      if (valueKeys.has(valueKey)) {
        return "variant_value_key_duplicate";
      }
      valueKeys.add(valueKey);
    }

    if (!hasValue) {
      return "variant_group_needs_value";
    }
  }

  return null;
}

export function normalizeOptionKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "");
}
