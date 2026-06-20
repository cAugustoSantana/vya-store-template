import { useTranslation } from "react-i18next";
import { Check, Truck } from "@phosphor-icons/react";
import {
  buildDeliverySteps,
  deliveryProgressPercent,
  type DeliveryStep,
} from "@/lib/orderDeliveryTimeline";
import type { PublicOrder } from "@/types/commerce";
import type { Locale } from "@shared/types";

type Props = {
  order: Pick<PublicOrder, "estado" | "createdAt">;
  locale: Locale;
};

const STEP_LABEL_KEYS = {
  order_confirmed: "payment.timeline.orderConfirmed",
  out_for_delivery: "payment.timeline.outForDelivery",
  delivered: "payment.timeline.delivered",
} as const;

function formatStepSubtitle(step: DeliveryStep, locale: Locale, t: (key: string) => string): string {
  if (step.state === "complete" && step.at) {
    return new Date(step.at).toLocaleString(locale, {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (step.state === "pending" || step.state === "active") {
    return t("payment.timeline.estimatedSoon");
  }
  return "";
}

export function OrderDeliveryTimeline({ order, locale }: Props) {
  const { t } = useTranslation();
  const steps = buildDeliverySteps(order);
  const progressPercent = deliveryProgressPercent(steps);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:p-8">
      <h3 className="mb-8 flex items-center gap-2 text-lg font-bold text-gray-900">
        <Truck size={22} weight="fill" className="text-brand-600" aria-hidden />
        {t("payment.deliveryStatus")}
      </h3>

      <div className="relative">
        <div className="absolute bottom-0 left-[15px] top-0 w-0.5 bg-gray-100" aria-hidden />
        <div
          className="absolute left-[15px] top-0 w-0.5 bg-brand-500 transition-all"
          style={{ height: `${progressPercent}%` }}
          aria-hidden
        />

        <div className="relative space-y-10">
          {steps.map((step) => {
            const isComplete = step.state === "complete";
            const isActive = step.state === "active";
            const isMuted = step.state === "pending";

            return (
              <div key={step.key} className="flex items-start gap-6">
                {isComplete ? (
                  <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-brand-600 shadow-sm">
                    <Check size={12} weight="bold" className="text-white" aria-hidden />
                  </div>
                ) : (
                  <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-200 bg-white shadow-sm">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-brand-500" : "bg-gray-300"}`}
                      aria-hidden
                    />
                  </div>
                )}

                <div>
                  <p
                    className={`font-bold ${
                      isMuted ? "text-gray-400" : "text-gray-900"
                    }`}
                  >
                    {t(STEP_LABEL_KEYS[step.key])}
                  </p>
                  <p
                    className={`text-sm ${
                      isMuted ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {formatStepSubtitle(step, locale, t)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
