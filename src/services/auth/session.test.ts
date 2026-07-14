import { describe, it, expect, beforeAll } from "vitest";
import { createSessionToken, verifySessionToken } from "./session";

beforeAll(() => {
  // session.ts throws if this is unset/too short; tests run without .env.
  process.env.SESSION_SECRET = "test-session-secret-at-least-32-chars-long";
});

describe("session tokens", () => {
  const payload = { sub: "profile-123", role: "customer" as const, email: "test@example.com" };

  it("creates a token that verifies back to the same payload", async () => {
    const token = await createSessionToken(payload);
    const verified = await verifySessionToken(token);
    expect(verified).toEqual(payload);
  });

  it("preserves the admin role distinctly from customer", async () => {
    const token = await createSessionToken({ ...payload, role: "admin" });
    const verified = await verifySessionToken(token);
    expect(verified?.role).toBe("admin");
  });

  it("rejects a garbage token", async () => {
    await expect(verifySessionToken("not-a-real-jwt")).resolves.toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createSessionToken(payload);
    process.env.SESSION_SECRET = "a-completely-different-secret-of-32-chars";
    await expect(verifySessionToken(token)).resolves.toBeNull();
    process.env.SESSION_SECRET = "test-session-secret-at-least-32-chars-long";
  });

  it("rejects a tampered token", async () => {
    const token = await createSessionToken(payload);
    const tampered = token.slice(0, -2) + (token.slice(-2) === "aa" ? "bb" : "aa");
    await expect(verifySessionToken(tampered)).resolves.toBeNull();
  });
});
