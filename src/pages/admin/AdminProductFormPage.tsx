import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminProduct,
  updateAdminProduct,
  uploadAdminProductImage,
} from "@/lib/api";
import { ProductImagesEditor } from "@/components/admin/ProductImagesEditor";
import {
  revokePendingPreviews,
  slotsFromUrls,
  type ProductImageSlot,
} from "@/components/admin/productImageSlots";
import { VariantOptionsEditor } from "@/components/admin/VariantOptionsEditor";
import { ProductVariantsEditor } from "@/components/admin/ProductVariantsEditor";
import {
  AdminBackLink,
  AdminButton,
  AdminCard,
  AdminError,
  AdminField,
  AdminInput,
  AdminPageHeader,
  AdminTextarea,
  AdminTwoCol,
} from "@/components/admin/AdminUi";
import {
  draftsToVariantOptions,
  validateVariantDrafts,
  variantOptionsToDrafts,
  type VariantGroupDraft,
} from "@/lib/variantOptions";
import type { Product, ProductVariant } from "@shared/product.types";
import { syncVariantsFromOptions } from "@shared/productVariants";
import { sanitizePersistedImageUrl } from "@shared/imageUrl";

type AdminOutletContext = { token: string };

function productFormError(err: unknown, t: (key: string) => string): string {
  const message = err instanceof Error ? err.message : "";
  if (message === "too_many_images") return t("admin.products.errors.tooManyImages");
  if (message === "invalid_images") return t("admin.products.errors.invalidImages");
  if (message === "imageUploadFailed") return t("admin.products.errors.imageUploadFailed");
  return message || t("common.error");
}

async function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve({ base64: result, mimeType: file.type });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function AdminProductFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const isEdit = Boolean(productId && productId !== "new");
  const { token } = useOutletContext<AdminOutletContext>();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState(productId ?? "");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [active, setActive] = useState(true);
  const [stockQuantity, setStockQuantity] = useState("0");
  const [variantGroups, setVariantGroups] = useState<VariantGroupDraft[]>([]);
  const [variantRows, setVariantRows] = useState<ProductVariant[]>([]);
  const [imageSlots, setImageSlots] = useState<ProductImageSlot[]>([]);
  const [savedImageUrls, setSavedImageUrls] = useState<string[]>([]);
  const createdIdRef = useRef<string | null>(null);

  const fillForm = (product: Product) => {
    setId(product.id);
    setName(product.name);
    setDescription(product.description);
    setPrice(String(product.price));
    setActive(product.active ?? true);
    setStockQuantity(String(product.stockQuantity ?? 0));
    setVariantGroups(variantOptionsToDrafts(product.variantOptions));
    setVariantRows(
      product.variants?.length
        ? product.variants
        : syncVariantsFromOptions(product.variantOptions),
    );
    const urls = (product.imageUrls?.length ? product.imageUrls : [product.imageUrl])
      .map((url) => sanitizePersistedImageUrl(url, ""))
      .filter((url) => url.length > 0);
    setImageSlots((current) => {
      revokePendingPreviews(current);
      return slotsFromUrls(urls);
    });
    setSavedImageUrls(urls);
  };

  useEffect(() => {
    if (!isEdit || !productId) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAdminProduct(token, productId);
        if (cancelled) return;
        fillForm(data.product);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEdit, productId, token]);

  useEffect(() => {
    const variantOptions = draftsToVariantOptions(variantGroups);
    setVariantRows((prev) => syncVariantsFromOptions(variantOptions, prev));
  }, [variantGroups]);

  const hasVariantRows = variantRows.length > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const validationError = validateVariantDrafts(variantGroups);
      if (validationError) {
        throw new Error(t(`admin.products.errors.${validationError}`));
      }

      const variantOptions = draftsToVariantOptions(variantGroups);
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        active,
        stockQuantity: hasVariantRows ? undefined : Number(stockQuantity),
        variantOptions,
        variants: hasVariantRows ? variantRows : [],
        imageUrls: imageSlots.flatMap((slot) => (slot.kind === "stored" ? [slot.url] : [])),
      };

      const existingId = (isEdit && productId) || createdIdRef.current;
      let savedId = existingId || id.trim();
      if (existingId) {
        await updateAdminProduct(token, existingId, payload);
      } else {
        if (!savedId) throw new Error(t("admin.products.errors.missingId"));
        const created = await createAdminProduct(token, { id: savedId, ...payload });
        savedId = created.product.id;
        createdIdRef.current = savedId;
      }

      const pending = imageSlots.filter((slot) => slot.kind === "pending");
      if (pending.length > 0) {
        const uploaded = new Map<string, string>();
        for (const slot of pending) {
          const { base64, mimeType } = await fileToBase64(slot.file);
          const result = await uploadAdminProductImage(token, savedId, base64, mimeType);
          if (!result.imageUrl) {
            throw new Error(t("admin.products.errors.imageUploadFailed"));
          }
          uploaded.set(slot.id, result.imageUrl);
        }
        const imageUrls = imageSlots.map((slot) =>
          slot.kind === "stored" ? slot.url : uploaded.get(slot.id) ?? "",
        );
        await updateAdminProduct(token, savedId, {
          imageUrls: imageUrls.filter((url) => url.length > 0),
        });
      }

      navigate("/admin/products");
    } catch (err) {
      setError(productFormError(err, t));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || !productId) return;
    const productName = name.trim() || productId;
    if (!window.confirm(t("admin.products.deleteConfirm", { name: productName }))) return;

    setDeleting(true);
    setError(null);
    try {
      await deleteAdminProduct(token, productId);
      navigate("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">{t("common.loading")}</p>;
  }

  return (
    <>
      <AdminBackLink to="/admin/products">{t("admin.products.back")}</AdminBackLink>
      <AdminPageHeader
        title={isEdit ? t("admin.products.edit") : t("admin.products.new")}
      />

      <form className="flex max-w-3xl flex-col gap-6" onSubmit={(e) => void handleSubmit(e)}>
        <AdminCard>
          <AdminField label={t("admin.products.id")} htmlFor="product-id">
            <AdminInput
              id="product-id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              disabled={isEdit}
              required
            />
          </AdminField>

          <AdminField label={t("admin.products.name")} htmlFor="product-name">
            <AdminInput
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </AdminField>

          <AdminField label={t("admin.products.description")} htmlFor="product-description">
            <AdminTextarea
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </AdminField>

          <AdminTwoCol>
            <AdminField label={t("admin.products.price")} htmlFor="price">
              <AdminInput
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </AdminField>
            {!hasVariantRows ? (
              <AdminField label={t("admin.products.stockQuantity")} htmlFor="stock-quantity">
                <AdminInput
                  id="stock-quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  required
                />
              </AdminField>
            ) : null}
          </AdminTwoCol>

          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            {t("admin.products.active")}
          </label>
        </AdminCard>

        <AdminCard>
          <VariantOptionsEditor groups={variantGroups} onChange={setVariantGroups} />
        </AdminCard>

        {hasVariantRows ? (
          <AdminCard>
            <ProductVariantsEditor
              variantOptions={draftsToVariantOptions(variantGroups)}
              basePrice={Number(price) || 0}
              variants={variantRows}
              onChange={setVariantRows}
            />
          </AdminCard>
        ) : null}

        <AdminCard>
          <AdminField label={t("admin.products.image")} htmlFor="image">
            <ProductImagesEditor
              productId={id.trim()}
              slots={imageSlots}
              savedUrls={savedImageUrls}
              onChange={setImageSlots}
            />
          </AdminField>
        </AdminCard>

        {error ? <AdminError>{error}</AdminError> : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving || deleting}
            className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-700 active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? t("common.loading") : t("admin.products.save")}
          </button>
          {isEdit ? (
            <AdminButton
              variant="danger"
              disabled={saving || deleting}
              onClick={() => void handleDelete()}
            >
              {deleting ? t("common.loading") : t("admin.products.delete")}
            </AdminButton>
          ) : null}
        </div>
      </form>
    </>
  );
}
