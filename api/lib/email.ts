import { Resend } from "resend";
import type { Locale } from "../../shared/types";
import { storeConfig } from "./config";
import type { OrderItemRow, OrderRow } from "../../shared/db.types";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function localized(field: Record<Locale, string>, locale: Locale): string {
  return field[locale] ?? field[storeConfig.defaultLocale];
}

function formatMoney(amount: number | string, locale: Locale): string {
  return new Intl.NumberFormat(locale === "es" ? "es-DO" : "en-US", {
    style: "currency",
    currency: storeConfig.currency,
    minimumFractionDigits: 0,
  }).format(Number(amount));
}

function itemsHtml(items: OrderItemRow[], locale: Locale): string {
  return items
    .map((item) => {
      const variants = Object.entries(item.variants)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      const lineTotal = Number(item.unit_price) * item.quantity;
      return `<li>${item.product_name}${variants ? ` (${variants})` : ""} × ${item.quantity} — ${formatMoney(lineTotal, locale)}</li>`;
    })
    .join("");
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

  const locale = params.order.locale as Locale;
  const total = formatMoney(params.order.total, locale);
  const list = itemsHtml(params.items, locale);
  const from = storeConfig.email.from;

  const customerSubject =
    locale === "es"
      ? `Pedido recibido — ${params.order.display_id}`
      : `Order received — ${params.order.display_id}`;

  const customerHtml =
    locale === "es"
      ? `<p>Hola ${params.order.buyer_name},</p>
         <p>Recibimos tu pedido <strong>${params.order.display_id}</strong>.</p>
         <p>Total: <strong>${total}</strong></p>
         <ul>${list}</ul>
         <p>Realiza la transferencia y completa tu comprobante aquí:</p>
         <p><a href="${params.paymentPageUrl}">${params.paymentPageUrl}</a></p>`
      : `<p>Hi ${params.order.buyer_name},</p>
         <p>We received your order <strong>${params.order.display_id}</strong>.</p>
         <p>Total: <strong>${total}</strong></p>
         <ul>${list}</ul>
         <p>Complete your bank transfer and upload proof here:</p>
         <p><a href="${params.paymentPageUrl}">${params.paymentPageUrl}</a></p>`;

  const ownerSubject = `New order ${params.order.display_id}`;
  const ownerHtml = `<p>New order <strong>${params.order.display_id}</strong></p>
    <p>Buyer: ${params.order.buyer_name}<br/>
    Phone: ${params.order.buyer_phone}<br/>
    Email: ${params.order.buyer_email}</p>
    <p>Total: ${total}</p>
    <ul>${list}</ul>
    <p>Status: payment confirmation pending</p>`;

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
      to: storeConfig.contact.ownerEmail,
      subject: ownerSubject,
      html: ownerHtml,
    });
  } catch (err) {
    console.error("email_owner_checkout_failed", err);
  }
}

export async function sendProofUploadedEmail(order: OrderRow) {
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: storeConfig.email.from,
      to: storeConfig.contact.ownerEmail,
      subject: `Proof uploaded — ${order.display_id}`,
      html: `<p>Payment proof uploaded for order <strong>${order.display_id}</strong>.</p>
        <p>Buyer: ${order.buyer_name} (${order.buyer_phone})</p>`,
    });
  } catch (err) {
    console.error("email_owner_proof_failed", err);
  }
}

export function getBankTransferDetails(locale: Locale) {
  const bt = storeConfig.payment.bankTransfer;
  return {
    bankName: localized(bt.bankName, locale),
    accountName: bt.accountName,
    accountNumber: bt.accountNumber,
    accountType: localized(bt.accountType, locale),
    referenceHint: localized(bt.referenceHint, locale),
  };
}
