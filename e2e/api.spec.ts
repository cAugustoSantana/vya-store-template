import { test, expect, hasE2eDatabase, uniqueEmail } from "./fixtures";

test.beforeEach(({ }, testInfo) => {
  if (!hasE2eDatabase()) testInfo.skip();
});

test("invalid productId returns 400", async ({ request }) => {
  const res = await request.post("/api/checkout", {
    data: {
      locale: "es",
      buyer: {
        name: "Bad Product",
        phone: "+1 849 620 2020",
        email: uniqueEmail("bad-product"),
      },
      items: [{ productId: "does-not-exist", variants: {}, quantity: 1 }],
      honeypot: "",
    },
  });
  expect(res.status()).toBe(400);
  const body = (await res.json()) as { error: string };
  expect(body.error).toBe("invalid_product");
});

test("rate limits repeated checkout requests", async ({ request }) => {
  const body = {
    locale: "es",
    buyer: {
      name: "Rate Limit",
      phone: "+1 849 620 2020",
      email: uniqueEmail("rate"),
    },
    items: [
      {
        productId: "prod-2",
        variants: { color: "navy" },
        quantity: 1,
      },
    ],
    honeypot: "",
  };

  let blocked = false;
  for (let i = 0; i < 4; i++) {
    const res = await request.post("/api/checkout", {
      data: { ...body, buyer: { ...body.buyer, email: uniqueEmail(`rate-${i}`) } },
    });
    if (res.status() === 429) blocked = true;
  }
  expect(blocked).toBe(true);
});
