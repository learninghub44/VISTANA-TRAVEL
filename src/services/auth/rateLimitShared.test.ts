import { describe, it, expect, vi, beforeEach } from "vitest";

describe("rateLimitShared", () => {
  beforeEach(() => vi.resetModules());

  it("uses the database counter when available", async () => {
    vi.doMock("@/services/db", () => ({ db: { hitRateLimit: vi.fn(async () => ({ ok: false, remaining: 0 })) } }));
    const { rateLimitShared } = await import("./rateLimit");
    await expect(rateLimitShared("k", 5, 1000)).resolves.toEqual({ ok: false, remaining: 0 });
  });

  it("falls back to the in-memory limiter when the database is unreachable", async () => {
    vi.doMock("@/services/db", () => ({ db: { hitRateLimit: vi.fn(async () => { throw new Error("fetch failed"); }) } }));
    const { rateLimitShared } = await import("./rateLimit");
    const results = [];
    for (let i = 0; i < 3; i++) results.push((await rateLimitShared("fallback-key", 2, 60_000)).ok);
    expect(results).toEqual([true, true, false]);
  });
});
