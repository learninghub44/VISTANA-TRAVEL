import { describe, it, expect } from "vitest";
import { quoteSchema, leadUpdateSchema } from "./leadSchema";

describe("quoteSchema", () => {
  const ok = { name: "Amina W", email: "A@X.com", tour_slug: "mara-5d", adults: 2, children: 0 };
  it("normalises the email and accepts a minimal request", () => {
    const r = quoteSchema.safeParse(ok);
    expect(r.success && r.data.email).toBe("a@x.com");
  });
  it("rejects bad guests, dates and phones", () => {
    expect(quoteSchema.safeParse({ ...ok, adults: 0 }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...ok, start_date: "soon" }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...ok, phone: "<x>" }).success).toBe(false);
  });
});
describe("leadUpdateSchema", () => {
  it("only allows known statuses", () => {
    expect(leadUpdateSchema.safeParse({ status: "Qualified" }).success).toBe(true);
    expect(leadUpdateSchema.safeParse({ status: "Hacked" }).success).toBe(false);
  });
});
