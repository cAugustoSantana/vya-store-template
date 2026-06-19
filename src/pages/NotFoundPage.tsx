import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import shared from "@/styles/shared.module.css";

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className={shared.page}>
      <h1>{t("common.notFound")}</h1>
      <Link to="/" className={shared.buttonSecondary}>
        {t("common.continueShopping")}
      </Link>
    </div>
  );
}
