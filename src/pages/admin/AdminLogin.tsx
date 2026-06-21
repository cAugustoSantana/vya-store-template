import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Lock } from "@phosphor-icons/react";
import { AdminButton, AdminCard, AdminInput } from "@/components/admin/AdminUi";

export function AdminLogin({ onLogin }: { onLogin: (password: string) => Promise<void> }) {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onLogin(password);
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gray-50 px-4 font-sans">
      <AdminCard className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Lock size={24} weight="bold" aria-hidden />
          </div>
          <h1 className="text-xl font-bold text-gray-900">{t("admin.title")}</h1>
          <p className="mt-1 text-sm text-gray-500">{t("admin.subtitle")}</p>
        </div>
        <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
          <AdminInput
            id="admin-password"
            label={t("admin.password")}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <AdminButton type="submit" className="w-full" disabled={loading}>
            {t("admin.login")}
          </AdminButton>
        </form>
      </AdminCard>
    </div>
  );
}
