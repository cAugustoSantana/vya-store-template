export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type EmailLayoutParams = {
  storeName: string;
  primaryColor: string;
  logoUrl: string;
  badge?: string;
  title: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
};

export function renderEmailLayout(params: EmailLayoutParams): string {
  const badge = params.badge
    ? `<div style="display:inline-block;padding:6px 12px;border-radius:999px;background:${params.primaryColor}15;color:${params.primaryColor};font-size:12px;font-weight:700;margin-bottom:16px;">${escapeHtml(params.badge)}</div>`
    : "";

  const cta = params.cta
    ? `<p style="margin:24px 0 0;"><a href="${escapeHtml(params.cta.href)}" style="display:inline-block;background:${params.primaryColor};color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:700;">${escapeHtml(params.cta.label)}</a></p>`
    : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#f9fafb;font-family:system-ui,-apple-system,sans-serif;color:#111827;">
  <div style="max-width:560px;margin:0 auto;">
    <div style="background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06);">
      <div style="padding:24px 24px 16px;border-bottom:1px solid #f3f4f6;text-align:center;">
        <img src="${escapeHtml(params.logoUrl)}" alt="${escapeHtml(params.storeName)}" width="48" height="48" style="border-radius:10px;object-fit:contain;" />
        <div style="margin-top:8px;font-size:14px;font-weight:700;color:#374151;">${escapeHtml(params.storeName)}</div>
      </div>
      <div style="padding:24px;">
        ${badge}
        <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;">${escapeHtml(params.title)}</h1>
        ${params.bodyHtml}
        ${cta}
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function renderOrderItemsTable(
  rows: { name: string; detail: string; total: string }[],
): string {
  const items = rows
    .map(
      (row) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
          <div style="font-weight:600;">${escapeHtml(row.name)}</div>
          <div style="font-size:12px;color:#6b7280;">${escapeHtml(row.detail)}</div>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:700;">${escapeHtml(row.total)}</td>
      </tr>`,
    )
    .join("");

  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;font-size:14px;">${items}</table>`;
}

export function renderShippingBlock(lines: string[]): string {
  return `<div style="margin-top:16px;padding:14px;border-radius:12px;background:#f9fafb;border:1px solid #e5e7eb;font-size:14px;line-height:1.6;">
    ${lines.map((line) => escapeHtml(line)).join("<br/>")}
  </div>`;
}

export function renderCallout(text: string, variant: "brand" | "green", primaryColor: string): string {
  const styles =
    variant === "green"
      ? "background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;"
      : `background:${primaryColor}10;border:1px solid ${primaryColor}33;color:#111827;`;
  return `<div style="margin:16px 0;padding:14px;border-radius:12px;${styles}font-size:14px;line-height:1.5;">${escapeHtml(text)}</div>`;
}
