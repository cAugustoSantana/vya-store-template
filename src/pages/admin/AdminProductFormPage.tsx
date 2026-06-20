import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState, type FormEvent } from "react";
import {
  createAdminProduct,
  fetchAdminProduct,
  updateAdminProduct,
  uploadAdminProductImage,
} from "@/lib/api";
import { VariantOptionsEditor } from "@/components/admin/VariantOptionsEditor";
import {
  draftsToVariantOptions,
  validateVariantDrafts,
  variantOptionsToDrafts,
  type VariantGroupDraft,
} from "@/lib/variantOptions";
import type { Product } from "@shared/product.types";
import shared from "@/styles/shared.module.css";
import styles from "./AdminProductFormPage.module.css";

type AdminOutletContext = { token: string };

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
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState(productId ?? "");
  const [nameEs, setNameEs] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descEs, setDescEs] = useState("");
  const [descEn, setDescEn] = useState("");
  const [price, setPrice] = useState("0");
  const [active, setActive] = useState(true);
  const [sortOrder, setSortOrder] = useState("0");
  const [variantGroups, setVariantGroups] = useState<VariantGroupDraft[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fillForm = (product: Product) => {
    setId(product.id);
    setNameEs(product.name.es);
    setNameEn(product.name.en);
    setDescEs(product.description.es);
    setDescEn(product.description.en);
    setPrice(String(product.price));
    setActive(product.active ?? true);
    setSortOrder(String(product.sortOrder ?? 0));
    setVariantGroups(variantOptionsToDrafts(product.variantOptions));
    setImagePreview(product.imageUrl);
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
        name: { es: nameEs, en: nameEn },
        description: { es: descEs, en: descEn },
        price: Number(price),
        active,
        sortOrder: Number(sortOrder),
        variantOptions,
        imageUrl: imagePreview ?? "/products/placeholder.svg",
      };

      let savedId = id.trim();
      if (isEdit && productId) {
        await updateAdminProduct(token, productId, payload);
      } else {
        if (!savedId) throw new Error(t("admin.products.errors.missingId"));
        const created = await createAdminProduct(token, { id: savedId, ...payload });
        savedId = created.product.id;
      }

      if (imageFile) {
        const { base64, mimeType } = await fileToBase64(imageFile);
        await uploadAdminProductImage(token, savedId, base64, mimeType);
      }

      navigate("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>{t("common.loading")}</p>;
  }

  return (
    <>
      <Link to="/admin/products" className={styles.backLink}>
        {t("admin.products.back")}
      </Link>
      <header className={shared.pageHeader}>
        <h1>{isEdit ? t("admin.products.edit") : t("admin.products.new")}</h1>
      </header>

      <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
        <div className={shared.field}>
          <label htmlFor="product-id">{t("admin.products.id")}</label>
          <input
            id="product-id"
            value={id}
            onChange={(e) => setId(e.target.value)}
            disabled={isEdit}
            required
          />
        </div>

        <div className={styles.twoCol}>
          <div className={shared.field}>
            <label htmlFor="name-es">{t("admin.products.nameEs")}</label>
            <input id="name-es" value={nameEs} onChange={(e) => setNameEs(e.target.value)} required />
          </div>
          <div className={shared.field}>
            <label htmlFor="name-en">{t("admin.products.nameEn")}</label>
            <input id="name-en" value={nameEn} onChange={(e) => setNameEn(e.target.value)} required />
          </div>
        </div>

        <div className={styles.twoCol}>
          <div className={shared.field}>
            <label htmlFor="desc-es">{t("admin.products.descEs")}</label>
            <textarea id="desc-es" value={descEs} onChange={(e) => setDescEs(e.target.value)} rows={3} required />
          </div>
          <div className={shared.field}>
            <label htmlFor="desc-en">{t("admin.products.descEn")}</label>
            <textarea id="desc-en" value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={3} required />
          </div>
        </div>

        <div className={styles.twoCol}>
          <div className={shared.field}>
            <label htmlFor="price">{t("admin.total")}</label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className={shared.field}>
            <label htmlFor="sort-order">{t("admin.products.sortOrder")}</label>
            <input
              id="sort-order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>
        </div>

        <label className={styles.checkbox}>
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          {t("admin.products.active")}
        </label>

        <VariantOptionsEditor groups={variantGroups} onChange={setVariantGroups} />

        <div className={shared.field}>
          <label htmlFor="image">{t("admin.products.image")}</label>
          <input
            id="image"
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setImageFile(file);
              setImagePreview(file ? URL.createObjectURL(file) : imagePreview);
            }}
          />
          {imagePreview && <img src={imagePreview} alt="" className={styles.preview} />}
        </div>

        {error && <p className={shared.error}>{error}</p>}

        <button type="submit" className={shared.button} disabled={saving}>
          {saving ? t("common.loading") : t("admin.products.save")}
        </button>
      </form>
    </>
  );
}
