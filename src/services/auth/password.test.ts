import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, generateToken, isStrongEnough } from "./password";

describe("password service", () => {
  it("hashes a password to something other than the plaintext", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(hash).not.toEqual("correct-horse-battery-staple");
    expect(hash.length).toBeGreaterThan(0);
  });

  it("verifies a correct password against its hash", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    await expect(verifyPassword("correct-horse-battery-staple", hash)).resolves.toBe(true);
  });

  it("rejects an incorrect password against a hash", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });

  it("produces a different hash each time (bcrypt salting)", async () => {
    const [hashA, hashB] = await Promise.all([
      hashPassword("same-password"),
      hashPassword("same-password"),
    ]);
    expect(hashA).not.toEqual(hashB);
  });

  it("generates tokens of sufficient length and uniqueness", () => {
    const a = generateToken();
    const b = generateToken();
    expect(a).toHaveLength(64); // 32 bytes -> 64 hex chars
    expect(a).not.toEqual(b);
  });

  it("flags short passwords as not strong enough", () => {
    expect(isStrongEnough("short")).toBe(false);
    expect(isStrongEnough("")).toBe(false);
  });

  it("accepts 8+ character passwords as strong enough", () => {
    expect(isStrongEnough("12345678")).toBe(true);
    expect(isStrongEnough("a-much-longer-passphrase")).toBe(true);
  });
});
