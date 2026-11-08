import { describe, it, expect } from "vitest";
import { rateLimit, getClientIp } from "./rateLimit";

describe("rateLimit", () => {
  it("allows requests under the limit", () => {
    const key = `test-allow-${Math.random()}`;
    const first = rateLimit(key, 3, 60_000);
    const second = rateLimit(key, 3, 60_000);
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(second.remaining).toBe(1);
  });

  it("blocks requests once the limit is exceeded", () => {
    const key = `test-block-${Math.random()}`;
    rateLimit(key, 2, 60_000);
    rateLimit(key, 2, 60_000);
    const third = rateLimit(key, 2, 60_000);
    expect(third.ok).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("tracks separate buckets per key", () => {
    const keyA = `test-bucket-a-${Math.random()}`;
    const keyB = `test-bucket-b-${Math.random()}`;
    rateLimit(keyA, 1, 60_000);
    const resultB = rateLimit(keyB, 1, 60_000);
    expect(resultB.ok).toBe(true);
  });

  it("resets the bucket after the window elapses", async () => {
    const key = `test-reset-${Math.random()}`;
    rateLimit(key, 1, 50);
    const blocked = rateLimit(key, 1, 50);
    expect(blocked.ok).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 60));
    const afterReset = rateLimit(key, 1, 50);
    expect(afterReset.ok).toBe(true);
  });
});

describe("getClientIp", () => {
  it("prefers Cloudflare's cf-connecting-ip over any client-supplied header", () => {
    const req = new Request("https://example.com", {
      headers: { "cf-connecting-ip": "203.0.113.5", "x-forwarded-for": "6.6.6.6, 10.0.0.1" },
    });
    expect(getClientIp(req)).toBe("203.0.113.5");
  });

  it("does not trust the first x-forwarded-for entry (client-controlled); uses the last proxy hop", () => {
    const req = new Request("https://example.com", {
      headers: { "x-forwarded-for": "6.6.6.6, 203.0.113.5" },
    });
    expect(getClientIp(req)).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip when cf-connecting-ip is absent", () => {
    const req = new Request("https://example.com", {
      headers: { "x-real-ip": "198.51.100.7" },
    });
    expect(getClientIp(req)).toBe("198.51.100.7");
  });

  it("returns 'unknown' when no IP header is present", () => {
    const req = new Request("https://example.com");
    expect(getClientIp(req)).toBe("unknown");
  });
});
