import { useTranslation } from "react-i18next";
import {
  createEmptyGroup,
  createEmptyValue,
  normalizeOptionKey,
  type VariantGroupDraft,
} from "@/lib/variantOptions";
import styles from "./VariantOptionsEditor.module.css";

type Props = {
  groups: VariantGroupDraft[];
  onChange: (groups: VariantGroupDraft[]) => void;
};

function updateGroup(
  groups: VariantGroupDraft[],
  groupId: string,
  patch: Partial<VariantGroupDraft>,
): VariantGroupDraft[] {
  return groups.map((group) => (group.id === groupId ? { ...group, ...patch } : group));
}

function updateValue(
  groups: VariantGroupDraft[],
  groupId: string,
  valueId: string,
  patch: Partial<VariantGroupDraft["values"][number]>,
): VariantGroupDraft[] {
  return groups.map((group) => {
    if (group.id !== groupId) return group;
    return {
      ...group,
      values: group.values.map((value) =>
        value.id === valueId ? { ...value, ...patch } : value,
      ),
    };
  });
}

export function VariantOptionsEditor({ groups, onChange }: Props) {
  const { t } = useTranslation();

  const addGroup = () => {
    onChange([...groups, createEmptyGroup()]);
  };

  const removeGroup = (groupId: string) => {
    onChange(groups.filter((group) => group.id !== groupId));
  };

  const addValue = (groupId: string) => {
    onChange(
      updateGroup(groups, groupId, {
        values: [
          ...(groups.find((g) => g.id === groupId)?.values ?? []),
          createEmptyValue(),
        ],
      }),
    );
  };

  const removeValue = (groupId: string, valueId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;
    const nextValues = group.values.filter((value) => value.id !== valueId);
    onChange(
      updateGroup(groups, groupId, {
        values: nextValues.length > 0 ? nextValues : [createEmptyValue()],
      }),
    );
  };

  return (
    <section className={styles.section} aria-labelledby="variant-options-title">
      <div className={styles.sectionHeader}>
        <div>
          <h2 id="variant-options-title" className={styles.sectionTitle}>
            {t("admin.products.variants")}
          </h2>
          <p className={styles.hint}>{t("admin.products.variantsHint")}</p>
        </div>
        <button type="button" className={styles.addBtn} onClick={addGroup}>
          {t("admin.products.addVariantGroup")}
        </button>
      </div>

      {groups.length === 0 ? (
        <p className={styles.empty}>{t("admin.products.noVariants")}</p>
      ) : (
        <div className={styles.groups}>
          {groups.map((group, groupIndex) => (
            <div key={group.id} className={styles.groupCard}>
              <div className={styles.groupHeader}>
                <div className={styles.groupFields}>
                  <div>
                    <span className={styles.fieldLabel}>{t("admin.products.groupKey")}</span>
                    <input
                      id={`variant-group-key-${groupIndex}`}
                      value={group.groupKey}
                      placeholder="size"
                      onChange={(e) =>
                        onChange(
                          updateGroup(groups, group.id, {
                            groupKey: normalizeOptionKey(e.target.value),
                          }),
                        )
                      }
                    />
                  </div>
                  <div>
                    <span className={styles.fieldLabel}>{t("admin.products.groupLabelEs")}</span>
                    <input
                      value={group.labelEs}
                      placeholder={t("admin.products.groupLabelEsPlaceholder")}
                      onChange={(e) =>
                        onChange(updateGroup(groups, group.id, { labelEs: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <span className={styles.fieldLabel}>{t("admin.products.groupLabelEn")}</span>
                    <input
                      value={group.labelEn}
                      placeholder={t("admin.products.groupLabelEnPlaceholder")}
                      onChange={(e) =>
                        onChange(updateGroup(groups, group.id, { labelEn: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.dangerBtn}
                  onClick={() => removeGroup(group.id)}
                >
                  {t("admin.products.removeGroup")}
                </button>
              </div>

              <div className={styles.valuesSection}>
                <p className={styles.valuesTitle}>{t("admin.products.options")}</p>
                {group.values.map((value, valueIndex) => (
                  <div key={value.id} className={styles.valueRow}>
                    <div>
                      <span className={styles.fieldLabel}>{t("admin.products.optionKey")}</span>
                      <input
                        id={groupIndex === 0 && valueIndex === 0 ? "variant-option-key" : undefined}
                        value={value.valueKey}
                        placeholder="m"
                        onChange={(e) =>
                          onChange(
                            updateValue(groups, group.id, value.id, {
                              valueKey: normalizeOptionKey(e.target.value),
                            }),
                          )
                        }
                      />
                    </div>
                    <div>
                      <span className={styles.fieldLabel}>{t("admin.products.optionLabelEs")}</span>
                      <input
                        value={value.labelEs}
                        placeholder="M"
                        onChange={(e) =>
                          onChange(
                            updateValue(groups, group.id, value.id, { labelEs: e.target.value }),
                          )
                        }
                      />
                    </div>
                    <div>
                      <span className={styles.fieldLabel}>{t("admin.products.optionLabelEn")}</span>
                      <input
                        value={value.labelEn}
                        placeholder="M"
                        onChange={(e) =>
                          onChange(
                            updateValue(groups, group.id, value.id, { labelEn: e.target.value }),
                          )
                        }
                      />
                    </div>
                    <button
                      type="button"
                      className={styles.dangerBtn}
                      aria-label={t("admin.products.removeOption")}
                      onClick={() => removeValue(group.id, value.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => addValue(group.id)}
                >
                  {t("admin.products.addOption")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
