import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("production database guard", () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => vi.unstubAllEnvs());

  it("refuses to fall back to the local JSON database in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    vi.stubEnv("NEXT_PHASE", "");
    const { db } = await import("./index");
    expect(() => db.getTours).toThrow(/Supabase is not configured in production/);
  });

  it("still allows the local database outside production", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    const { db } = await import("./index");
    expect(typeof db.getTours).toBe("function");
  });
});
