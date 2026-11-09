import { describe, it, expect } from "vitest";
import { normalizeWhatsAppNumber, buildWhatsAppUrl } from "./whatsapp";

describe("whatsapp helpers", () => {
  it("strips formatting from valid numbers", () => {
    expect(normalizeWhatsAppNumber("+254 700-123 456")).toBe("254700123456");
  });
  it("rejects empty or implausible numbers", () => {
    expect(normalizeWhatsAppNumber("")).toBeNull();
    expect(normalizeWhatsAppNumber(undefined)).toBeNull();
    expect(normalizeWhatsAppNumber("123")).toBeNull();
    expect(normalizeWhatsAppNumber("1".repeat(16))).toBeNull();
  });
  it("builds a wa.me link with an encoded message", () => {
    expect(buildWhatsAppUrl("+254700123456", "Hi & hello")).toBe("https://wa.me/254700123456?text=Hi%20%26%20hello");
    expect(buildWhatsAppUrl("+254700123456")).toBe("https://wa.me/254700123456");
    expect(buildWhatsAppUrl("nope", "x")).toBeNull();
  });
});
