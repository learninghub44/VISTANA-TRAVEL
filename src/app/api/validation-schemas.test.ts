import { describe, it, expect } from "vitest";
import { registerSchema } from "@/app/api/auth/register/route";
import { loginSchema } from "@/app/api/auth/login/route";
import { schema as requestResetSchema } from "@/app/api/auth/request-reset/route";
import { schema as resetPasswordSchema } from "@/app/api/auth/reset-password/route";
import { schema as newsletterSchema } from "@/app/api/newsletter/route";

describe("registerSchema", () => {
  it("accepts a valid registration payload", () => {
    const result = registerSchema.safeParse({
      name: "Chris Odhiambo",
      email: "chris@example.com",
      password: "correct-horse",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a password under 8 characters", () => {
    const result = registerSchema.safeParse({
      name: "Chris Odhiambo",
      email: "chris@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({
      name: "Chris Odhiambo",
      email: "not-an-email",
      password: "correct-horse",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a name under 2 characters", () => {
    const result = registerSchema.safeParse({
      name: "C",
      email: "chris@example.com",
      password: "correct-horse",
    });
    expect(result.success).toBe(false);
  });

  it("allows phone to be omitted", () => {
    const result = registerSchema.safeParse({
      name: "Chris Odhiambo",
      email: "chris@example.com",
      password: "correct-horse",
    });
    expect(result.success).toBe(true);
  });
});

describe("loginSchema", () => {
  it("accepts a valid login payload", () => {
    expect(loginSchema.safeParse({ email: "chris@example.com", password: "anything" }).success).toBe(true);
  });

  it("rejects an empty password", () => {
    expect(loginSchema.safeParse({ email: "chris@example.com", password: "" }).success).toBe(false);
  });

  it("rejects a malformed email", () => {
    expect(loginSchema.safeParse({ email: "nope", password: "anything" }).success).toBe(false);
  });
});

describe("requestResetSchema", () => {
  it("accepts a valid email", () => {
    expect(requestResetSchema.safeParse({ email: "chris@example.com" }).success).toBe(true);
  });

  it("rejects a missing email", () => {
    expect(requestResetSchema.safeParse({}).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("accepts a valid token and password", () => {
    expect(
      resetPasswordSchema.safeParse({ token: "a-long-enough-token", password: "correct-horse" }).success
    ).toBe(true);
  });

  it("rejects a token under 10 characters", () => {
    expect(resetPasswordSchema.safeParse({ token: "short", password: "correct-horse" }).success).toBe(false);
  });

  it("rejects a password under 8 characters", () => {
    expect(
      resetPasswordSchema.safeParse({ token: "a-long-enough-token", password: "short" }).success
    ).toBe(false);
  });
});

describe("newsletterSchema", () => {
  it("accepts a valid email", () => {
    expect(newsletterSchema.safeParse({ email: "chris@example.com" }).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(newsletterSchema.safeParse({ email: "nope" }).success).toBe(false);
  });
});
