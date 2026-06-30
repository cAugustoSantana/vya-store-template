import type { PublicOrder } from "@/types/commerce";

export type DeliveryStepState = "complete" | "active" | "pending";

export type DeliveryStepKey =
  | "order_confirmed"
  | "out_for_delivery"
  | "delivered";

export type DeliveryStep = {
  key: DeliveryStepKey;
  state: DeliveryStepState;
  at?: string;
};

const FULFILLMENT_RANK: Record<string, number> = {
  payment_confirmation_pending: 0,
  confirmed: 1,
  in_production: 2,
  out_for_delivery: 3,
  delivered: 4,
  cancelled: 0,
};

export function buildDeliverySteps(
  order: Pick<PublicOrder, "estado" | "createdAt">,
): DeliveryStep[] {
  const rank = FULFILLMENT_RANK[order.estado] ?? 0;

  if (order.estado === "cancelled") {
    return [
      { key: "order_confirmed", state: "complete", at: order.createdAt },
      { key: "out_for_delivery", state: "pending" },
      { key: "delivered", state: "pending" },
    ];
  }

  const steps: DeliveryStep[] = [
    {
      key: "order_confirmed",
      state: "complete",
      at: order.createdAt,
    },
    {
      key: "out_for_delivery",
      state:
        rank >= 4 ? "complete" : rank === 3 ? "active" : rank >= 1 ? "pending" : "pending",
    },
    {
      key: "delivered",
      state: rank >= 4 ? "complete" : rank === 3 ? "active" : "pending",
    },
  ];

  return steps;
}

export function deliveryProgressPercent(steps: DeliveryStep[]): number {
  const completedCount = steps.filter((step) => step.state === "complete").length;
  if (steps.length <= 1 || completedCount === 0) return 0;
  return Math.min(100, (completedCount / (steps.length - 1)) * 100);
}
