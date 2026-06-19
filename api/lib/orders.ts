import { randomUUID } from "crypto";
import { storeConfig } from "./config";
import { getSql } from "./db";
import type { OrderItemRow, OrderRow, OrderWithItems } from "../../shared/db.types";

export function buildDisplayId(uuid: string): string {
  const hex = uuid.replace(/-/g, "");
  return `${storeConfig.storeSlug}-${hex.slice(-5).toLowerCase()}`;
}

export async function createOrder(params: {
  buyer: { name: string; phone: string; email: string };
  locale: string;
  total: number;
  lines: {
    productId: string;
    productName: string;
    variants: Record<string, string>;
    quantity: number;
    unitPrice: number;
  }[];
}): Promise<{ order: OrderRow; items: OrderItemRow[] }> {
  const sql = getSql();
  const id = randomUUID();
  let displayId = buildDisplayId(id);

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const orderRows = (await sql`
        INSERT INTO orders (
          id, display_id, buyer_name, buyer_phone, buyer_email,
          estado, total, locale, payment_provider
        ) VALUES (
          ${id}::uuid,
          ${displayId},
          ${params.buyer.name},
          ${params.buyer.phone},
          ${params.buyer.email},
          ${storeConfig.defaultOrderStatus},
          ${params.total},
          ${params.locale},
          ${storeConfig.payment.provider}
        )
        RETURNING *
      `) as OrderRow[];

      const order = orderRows[0]!;

      const items: OrderItemRow[] = [];
      for (const line of params.lines) {
        const itemRows = (await sql`
          INSERT INTO order_items (
            order_id, product_id, product_name, variants, quantity, unit_price
          ) VALUES (
            ${order.id}::uuid,
            ${line.productId},
            ${line.productName},
            ${JSON.stringify(line.variants)}::jsonb,
            ${line.quantity},
            ${line.unitPrice}
          )
          RETURNING *
        `) as OrderItemRow[];
        const item = itemRows[0]!;
        items.push({
          ...item,
          variants:
            typeof item.variants === "string"
              ? JSON.parse(item.variants)
              : item.variants,
        });
      }

      return { order, items };
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "23505" && attempt < 4) {
        displayId = buildDisplayId(randomUUID());
        continue;
      }
      throw err;
    }
  }

  throw new Error("display_id_collision");
}

export async function getOrderByDisplayId(displayId: string): Promise<OrderWithItems | null> {
  const sql = getSql();
  const orders = (await sql`
    SELECT * FROM orders WHERE display_id = ${displayId} LIMIT 1
  `) as OrderRow[];

  const order = orders[0];
  if (!order) return null;

  const items = (await sql`
    SELECT * FROM order_items WHERE order_id = ${order.id}::uuid ORDER BY id
  `) as OrderItemRow[];

  return {
    ...order,
    items: items.map((item) => ({
      ...item,
      variants:
        typeof item.variants === "string" ? JSON.parse(item.variants) : item.variants,
    })),
  };
}

export async function listOrdersWithItems(): Promise<OrderWithItems[]> {
  const sql = getSql();
  const orders = (await sql`
    SELECT * FROM orders ORDER BY created_at DESC
  `) as OrderRow[];

  const result: OrderWithItems[] = [];
  for (const order of orders) {
    const items = (await sql`
      SELECT * FROM order_items WHERE order_id = ${order.id}::uuid ORDER BY id
    `) as OrderItemRow[];
    result.push({
      ...order,
      items: items.map((item) => ({
        ...item,
        variants:
          typeof item.variants === "string" ? JSON.parse(item.variants) : item.variants,
      })),
    });
  }
  return result;
}

export async function updateOrderStatus(orderId: string, estado: string): Promise<OrderRow | null> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE orders
    SET estado = ${estado},
        payment_verified_at = CASE WHEN ${estado} = 'confirmed' THEN now() ELSE payment_verified_at END
    WHERE id = ${orderId}::uuid
    RETURNING *
  `) as OrderRow[];
  return rows[0] ?? null;
}

export async function updateProofMethod(
  displayId: string,
  method: "upload" | "whatsapp",
  proofUrl?: string,
): Promise<OrderRow | null> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE orders
    SET payment_proof_method = ${method},
        payment_proof_url = COALESCE(${proofUrl ?? null}, payment_proof_url)
    WHERE display_id = ${displayId}
    RETURNING *
  `) as OrderRow[];
  return rows[0] ?? null;
}

export async function getOrderById(orderId: string): Promise<OrderRow | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT * FROM orders WHERE id = ${orderId}::uuid LIMIT 1
  `) as OrderRow[];
  return rows[0] ?? null;
}
