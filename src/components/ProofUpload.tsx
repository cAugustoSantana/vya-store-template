import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { uploadProof } from "@/lib/api";
import shared from "@/styles/shared.module.css";
import styles from "./ProofUpload.module.css";

type Props = {
  displayId: string;
  onUploaded: () => void;
  disabled?: boolean;
};

const ALLOWED = ["image/png", "image/jpeg"];

export function ProofUpload({ displayId, onUploaded, disabled }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = async (file: File | null) => {
    if (!file || disabled) return;
    if (!ALLOWED.includes(file.type)) {
      setError(t("payment.uploadHint"));
      return;
    }
    setError(null);
    setUploading(true);

    try {
      const dataUrl = await readAsDataUrl(file);
      setPreview(dataUrl);
      const base64 = dataUrl.split(",")[1] ?? "";
      await uploadProof(displayId, base64, file.type);
      onUploaded();
    } catch {
      setError(t("common.error"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.upload}>
      <p className={styles.hint}>{t("payment.uploadHint")}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        capture="environment"
        className={styles.input}
        disabled={disabled || uploading}
        onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
      />
      {preview && (
        <img src={preview} alt="" className={styles.preview} />
      )}
      {error && <p className={shared.error}>{error}</p>}
      {uploading && <p>{t("common.loading")}</p>}
    </div>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
