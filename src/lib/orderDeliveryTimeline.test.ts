import { describe, expect, it } from "vitest";
import { buildDeliverySteps, deliveryProgressPercent } from "./orderDeliveryTimeline";

describe("buildDeliverySteps", () => {
  const createdAt = "2023-10-24T18:34:00.000Z";

  it("marks only order confirmed when payment is pending", () => {
    const steps = buildDeliverySteps({
      estado: "payment_confirmation_pending",
      createdAt,
    });
    expect(steps[0]?.state).toBe("complete");
    expect(steps[1]?.state).toBe("pending");
    expect(steps[2]?.state).toBe("pending");
  });

  it("activates out for delivery when order is confirmed", () => {
    const steps = buildDeliverySteps({ estado: "confirmed", createdAt });
    expect(steps[1]?.state).toBe("active");
  });

  it("completes all steps when delivered", () => {
    const steps = buildDeliverySteps({ estado: "delivered", createdAt });
    expect(steps.every((step) => step.state === "complete")).toBe(true);
    expect(deliveryProgressPercent(steps)).toBe(100);
  });
});
