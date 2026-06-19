import { useTranslation } from "react-i18next";
import { statusColors } from "@/lib/constants";
import styles from "./StatusBadge.module.css";

type Props = {
  status: string;
};

export function StatusBadge({ status }: Props) {
  const { t } = useTranslation();
  const color = statusColors[status] ?? "#6b7280";
  const label = t(`orderStatus.${status}`, { defaultValue: status });

  return (
    <span className={styles.badge} style={{ backgroundColor: color }}>
      {label}
    </span>
  );
}
