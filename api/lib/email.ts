import { Resend } from "resend";
import type { Locale, OrderStatus } from "../../shared/types.js";
import type { StoreSettingsData } from "../../shared/storeSettings.types.js";
import { resolveLocalized } from "../../shared/localized.js";
import { getStoreConfig, localizedField } from "./storeSettings.js";
import type { OrderItemRow, OrderRow } from "../../shared/db.types.js";
import { getOrderWithItemsById } from "./orders.js";
import {
  escapeHtml,
  renderCallout,
  renderEmailLayout,
  renderOrderItemsTable,
  renderShippingBlock,
} from "./emailTemplates.js";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export function getSiteOriginForEmail(): string {
  if (process.env.SITE_URL) {
    return process.env.SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

function formatMoney(amount: number | string, locale: Locale, config: StoreSettingsData): string {
  return new Intl.NumberFormat(locale === "es" ? "es-DO" : "en-US", {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits: 0,
  }).format(Number(amount));
}

function logoUrlForEmail(origin: string): string {
  return `${origin}/api/settings/logo`;
}

function orderItemsRows(
  items: OrderItemRow[],
  locale: Locale,
  config: StoreSettingsData,
) {
  return items.map((item) => {
    const variants = Object.entries(item.variants)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    const lineTotal = Number(item.unit_price) * item.quantity;
    return {
      name: item.product_name,
      detail: `${variants ? `${variants} • ` : ""}× ${item.quantity}`,
      total: formatMoney(lineTotal, locale, config),
    };
  });
}

function storeDisplayName(config: StoreSettingsData, locale: Locale): string {
  return resolveLocalized(config.storeName, locale, config.defaultLocale);
}

export async function sendCheckoutEmails(params: {
  order: OrderRow;
  items: OrderItemRow[];
  paymentPageUrl: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("email_skipped_no_resend_key");
    return;
  }

  const config = await getStoreConfig();
  const locale = params.order.locale as Locale;
  const origin = getSiteOriginForEmail();
  const storeName = storeDisplayName(config, locale);
  const total = formatMoney(params.order.total, locale, config);
  const from = config.email.from;
  const itemsTable = renderOrderItemsTable(orderItemsRows(params.items, locale, config));
  const shipping = renderShippingBlock([
    params.order.buyer_name,
    params.order.shipping_address,
    `${params.order.shipping_city} — ${params.order.shipping_postal_code}`,
  ]);

  const customerSubject =
    locale === "es"
      ? `Pedido recibido — ${params.order.display_id}`
      : `Order received — ${params.order.display_id}`;

  const customerHtml = renderEmailLayout({
    storeName,
    primaryColor: config.primaryColor,
    logoUrl: logoUrlForEmail(origin),
    badge: locale === "es" ? "Pedido recibido" : "Order received",
    title:
      locale === "es"
        ? `Hola ${params.order.buyer_name}, recibimos tu pedido`
        : `Hi ${params.order.buyer_name}, we received your order`,
    bodyHtml: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;">${locale === "es" ? "Tu pedido" : "Your order"} <strong>${escapeHtml(params.order.display_id)}</strong> — <strong>${escapeHtml(total)}</strong></p>
      ${renderCallout(locale === "es" ? "Realiza la transferencia y sube tu comprobante para confirmar el pago." : "Complete your bank transfer and upload proof to confirm payment.", "brand", config.primaryColor)}
      ${itemsTable}
      ${shipping}
    `,
    cta: {
      label: locale === "es" ? "Ver pedido y pagar" : "View order and pay",
      href: params.paymentPageUrl,
    },
  });

  const ownerHtml = renderEmailLayout({
    storeName,
    primaryColor: config.primaryColor,
    logoUrl: logoUrlForEmail(origin),
    badge: "New order",
    title: `New order ${params.order.display_id}`,
    bodyHtml: `
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;">
        ${escapeHtml(params.order.buyer_name)}<br/>
        ${escapeHtml(params.order.buyer_phone)}<br/>
        ${escapeHtml(params.order.buyer_email)}
      </p>
      ${itemsTable}
      ${shipping}
      <p style="margin:12px 0 0;font-weight:700;">Total: ${escapeHtml(total)}</p>
    `,
    cta: {
      label: "View in admin",
      href: `${origin}/admin/orders/${encodeURIComponent(params.order.display_id)}`,
    },
  });

  try {
    await resend.emails.send({
      from,
      to: params.order.buyer_email,
      subject: customerSubject,
      html: customerHtml,
    });
  } catch (err) {
    console.error("email_customer_checkout_failed", err);
  }

  try {
    await resend.emails.send({
      from,
      to: config.contact.ownerEmail,
      subject: `New order ${params.order.display_id}`,
      html: ownerHtml,
    });
  } catch (err) {
    console.error("email_owner_checkout_failed", err);
  }
}

export async function sendProofUploadedEmail(order: OrderRow) {
  const resend = getResend();
  if (!resend) return;

  const config = await getStoreConfig();
  const origin = getSiteOriginForEmail();
  const storeName = storeDisplayName(config, config.defaultLocale);

  try {
    await resend.emails.send({
      from: config.email.from,
      to: config.contact.ownerEmail,
      subject: `Proof uploaded — ${order.display_id}`,
      html: renderEmailLayout({
        storeName,
        primaryColor: config.primaryColor,
        logoUrl: logoUrlForEmail(origin),
        badge: "Proof uploaded",
        title: `Payment proof for ${order.display_id}`,
        bodyHtml: `<p style="margin:0;font-size:15px;line-height:1.6;">Buyer: ${escapeHtml(order.buyer_name)} (${escapeHtml(order.buyer_phone)})</p>`,
        cta: {
          label: "Review in admin",
          href: `${origin}/admin/orders/${encodeURIComponent(order.display_id)}`,
        },
      }),
    });
  } catch (err) {
    console.error("email_owner_proof_failed", err);
  }
}

async function sendStatusEmails(params: {
  order: OrderRow;
  items: OrderItemRow[];
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
}) {
  const resend = getResend();
  if (!resend) return;

  const config = await getStoreConfig();
  const locale = params.order.locale as Locale;
  const origin = getSiteOriginForEmail();
  const storeName = storeDisplayName(config, locale);
  const from = config.email.from;
  const total = formatMoney(params.order.total, locale, config);
  const itemsTable = renderOrderItemsTable(orderItemsRows(params.items, locale, config));
  const shipping = renderShippingBlock([
    params.order.buyer_name,
    params.order.shipping_address,
    `${params.order.shipping_city} — ${params.order.shipping_postal_code}`,
  ]);
  const paymentUrl = `${origin}/order/payment/${params.order.display_id}`;
  const adminUrl = `${origin}/admin/orders/${encodeURIComponent(params.order.display_id)}`;

  if (params.newStatus === "confirmed" && params.previousStatus !== "confirmed") {
    const subject =
      locale === "es"
        ? `Pago confirmado — ${params.order.display_id}`
        : `Payment confirmed — ${params.order.display_id}`;
    const customerHtml = renderEmailLayout({
      storeName,
      primaryColor: config.primaryColor,
      logoUrl: logoUrlForEmail(origin),
      badge: locale === "es" ? "Pago confirmado" : "Payment confirmed",
      title: locale === "es" ? "¡Tu pago fue confirmado!" : "Your payment was confirmed!",
      bodyHtml: `
        ${renderCallout(locale === "es" ? "Tu pedido está confirmado y en preparación." : "Your order is confirmed and being prepared.", "green", config.primaryColor)}
        ${itemsTable}
        <p style="margin:12px 0 0;font-weight:700;">Total: ${escapeHtml(total)}</p>
      `,
      cta: { label: locale === "es" ? "Ver pedido" : "View order", href: paymentUrl },
    });

    const ownerHtml = renderEmailLayout({
      storeName,
      primaryColor: config.primaryColor,
      logoUrl: logoUrlForEmail(origin),
      badge: "Payment confirmed",
      title: `Payment confirmed — ${params.order.display_id}`,
      bodyHtml: `<p style="margin:0;font-size:15px;line-height:1.6;">Order ${escapeHtml(params.order.display_id)} marked as confirmed.</p>`,
      cta: { label: "View in admin", href: adminUrl },
    });

    await resend.emails.send({ from, to: params.order.buyer_email, subject, html: customerHtml });
    await resend.emails.send({
      from,
      to: config.contact.ownerEmail,
      subject: `Payment confirmed — ${params.order.display_id}`,
      html: ownerHtml,
    });
  }

  if (params.newStatus === "out_for_delivery" && params.previousStatus !== "out_for_delivery") {
    const subject =
      locale === "es"
        ? `Tu pedido va en camino — ${params.order.display_id}`
        : `Your order is on the way — ${params.order.display_id}`;
    const customerHtml = renderEmailLayout({
      storeName,
      primaryColor: config.primaryColor,
      logoUrl: logoUrlForEmail(origin),
      badge: locale === "es" ? "En camino" : "On the way",
      title: locale === "es" ? "¡Tu pedido va en camino!" : "Your order is on the way!",
      bodyHtml: `
        ${renderCallout(locale === "es" ? "Tu pedido salió para entrega." : "Your order is out for delivery.", "brand", config.primaryColor)}
        ${shipping}
        ${itemsTable}
      `,
      cta: { label: locale === "es" ? "Ver pedido" : "View order", href: paymentUrl },
    });

    await resend.emails.send({ from, to: params.order.buyer_email, subject, html: customerHtml });
  }
}

export async function notifyOrderStatusChange(params: {
  orderId: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
}) {
  if (params.previousStatus === params.newStatus) return;

  const orderWithItems = await getOrderWithItemsById(params.orderId);
  if (!orderWithItems) return;

  const { items, ...order } = orderWithItems;
  await sendStatusEmails({
    order,
    items,
    previousStatus: params.previousStatus,
    newStatus: params.newStatus,
  });
}

export function getBankTransferDetails(locale: Locale, config: StoreSettingsData) {
  const bt = config.payment.bankTransfer;
  return {
    instructions: localizedField(bt.instructions, locale, config),
    referenceHint: localizedField(bt.referenceHint, locale, config),
  };
}
