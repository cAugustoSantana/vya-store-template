import { useTranslation } from "react-i18next";
import { X } from "@phosphor-icons/react";
import { SIZE_GUIDE_ROWS } from "@/lib/variantSwatches";

type Props = {
  open: boolean;
  onClose: () => void;
  selectedSizeKey?: string;
};

export function SizeGuideDialog({ open, onClose, selectedSizeKey }: Props) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        aria-label={t("cart.close")}
        onClick={onClose}
      />
      <div
        className="relative max-h-[85vh] w-full max-w-lg overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-guide-title"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 id="size-guide-title" className="text-lg font-extrabold text-gray-900">
            {t("productDetail.detailedSizeGuide")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label={t("cart.close")}
          >
            <X size={18} weight="bold" aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-5 py-3 font-bold uppercase tracking-wider text-gray-500">
                  {t("productDetail.sizeColumn")}
                </th>
                <th className="px-5 py-3 font-bold uppercase tracking-wider text-gray-500">
                  {t("productDetail.chestColumn")}
                </th>
                <th className="px-5 py-3 font-bold uppercase tracking-wider text-gray-500">
                  {t("productDetail.lengthColumn")}
                </th>
                <th className="px-5 py-3 font-bold uppercase tracking-wider text-gray-500">
                  {t("productDetail.sleeveColumn")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {SIZE_GUIDE_ROWS.map((row, i) => {
                const isSelected = selectedSizeKey?.toLowerCase() === row.size.toLowerCase();
                return (
                  <tr key={row.size} className={i % 2 === 1 ? "bg-gray-50/30" : undefined}>
                    <td
                      className={`px-5 py-3 font-bold ${isSelected ? "text-brand-600" : "text-gray-900"}`}
                    >
                      {row.size}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{row.chest}</td>
                    <td className="px-5 py-3 text-gray-600">{row.length}</td>
                    <td className="px-5 py-3 text-gray-600">{row.sleeve}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
