import { useState } from "react";
import { useTranslation } from "react-i18next";
import { recordProofMethod } from "@/lib/api";
import {
  buildPaymentProofWhatsAppMessage,
  buildStoreWhatsAppUrl,
} from "@/lib/whatsapp";
import shared from "@/styles/shared.module.css";

type Props = {
  displayId: string;
  buyerName: string;
  totalFormatted: string;
  locale: "es" | "en";
  disabled?: boolean;
  onSent?: () => void;
};

export function WhatsAppProofButton({
  displayId,
  buyerName,
  totalFormatted,
  locale,
  disabled,
  onSent,
}: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || loading) return;
    setLoading(true);
    try {
      await recordProofMethod(displayId, "whatsapp");
      const text = buildPaymentProofWhatsAppMessage({
        displayId,
        buyerName,
        totalFormatted,
        locale,
      });
      window.open(buildStoreWhatsAppUrl(text), "_blank", "noopener,noreferrer");
      onSent?.();
    } catch {
      // still open WhatsApp even if API fails
      const text = buildPaymentProofWhatsAppMessage({
        displayId,
        buyerName,
        totalFormatted,
        locale,
      });
      window.open(buildStoreWhatsAppUrl(text), "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={shared.buttonSecondary}
      disabled={disabled || loading}
      onClick={() => void handleClick()}
    >
      {t("payment.whatsappProof")}
    </button>
  );
}
