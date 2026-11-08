import { describe, it, expect, vi } from "vitest";
import { withResilience, DatabaseUnavailableError } from "./resilient";

function make(overrides: Record<string, (...a: unknown[]) => Promise<unknown>>) {
  return withResilience(overrides as never, { timeoutMs: 50, retries: 1, failureThreshold: 2, cooldownMs: 1000, now: () => clock.t }) as Record<string, (...a: unknown[]) => Promise<unknown>>;
}
const clock = { t: 1_000_000 };
const down = () => Promise.reject(new Error("fetch failed"));

describe("withResilience", () => {
  it("passes results through and retries a transient read failure once", async () => {
    let n = 0;
    const db = make({ getTours: async () => (++n === 1 ? Promise.reject(new Error("fetch failed")) : ["t1"]) });
    await expect(db.getTours()).resolves.toEqual(["t1"]);
    expect(n).toBe(2);
  });

  it("times out a hung call instead of hanging the page", async () => {
    const db = make({ getTours: () => new Promise(() => {}) });
    await expect(db.getTours()).rejects.toBeInstanceOf(DatabaseUnavailableError);
  });

  it("serves the last good read when the database goes down", async () => {
    let healthy = true;
    const db = make({ getTours: async () => (healthy ? ["real tour"] : down()) });
    await expect(db.getTours()).resolves.toEqual(["real tour"]);
    healthy = false;
    await expect(db.getTours()).resolves.toEqual(["real tour"]);
  });

  it("throws when down and there is nothing stale to serve", async () => {
    const db = make({ getTours: down });
    await expect(db.getTours()).rejects.toThrow();
  });

  it("opens the circuit after repeated failures and fails fast", async () => {
    const fn = vi.fn(down);
    const db = make({ getTours: fn });
    await db.getTours().catch(() => {});
    await db.getTours().catch(() => {});
    const before = fn.mock.calls.length;
    await db.getTours().catch(() => {});
    expect(fn.mock.calls.length).toBe(before); // breaker open: DB not touched
    clock.t += 2000; // cool-down elapsed -> tries again
    await db.getTours().catch(() => {});
    expect(fn.mock.calls.length).toBeGreaterThan(before);
  });

  it("never retries or serves stale for writes", async () => {
    const fn = vi.fn(down);
    const db = make({ saveBooking: fn });
    await expect(db.saveBooking({ id: 1 })).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("does not treat ordinary data errors as an outage", async () => {
    const fn = vi.fn(async () => Promise.reject(new Error("duplicate key value violates unique constraint")));
    const db = make({ getTours: fn });
    await expect(db.getTours()).rejects.toThrow(/duplicate key/);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
