import { describe, it, expect } from "vitest";
import { registerSchema } from "@/app/api/auth/register/route";
import { loginSchema } from "@/app/api/auth/login/route";
import { schema as requestResetSchema } from "@/app/api/auth/request-reset/route";
import { schema as resetPasswordSchema } from "@/app/api/auth/reset-password/route";
import { schema as newsletterSchema } from "@/app/api/newsletter/route";
import { contactSchema } from "@/app/api/contact/route";

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

describe("email normalisation", () => {
  it("lower-cases and trims emails so case variants are one account", () => {
    const r = loginSchema.safeParse({ email: "  Jane@Example.COM ", password: "x" });
    expect(r.success && r.data.email).toBe("jane@example.com");
  });
});

describe("password length caps (scrypt DoS guard)", () => {
  it("rejects absurdly long passwords on register, login and reset", () => {
    const long = "a".repeat(129);
    expect(registerSchema.safeParse({ name: "Jane Doe", email: "j@x.com", password: long }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "j@x.com", password: long }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ token: "t".repeat(20), password: long }).success).toBe(false);
  });
});

describe("contactSchema", () => {
  const valid = { name: "Amina Wanjiru", email: "amina@example.com", subject: "Maasai Mara honeymoon", message: "We'd like a 5-day safari in July for two." };

  it("accepts a valid inquiry", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects too-short messages and bad emails", () => {
    expect(contactSchema.safeParse({ ...valid, message: "hi" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
  });
  it("rejects oversized fields", () => {
    expect(contactSchema.safeParse({ ...valid, message: "x".repeat(3001) }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, subject: "s".repeat(151) }).success).toBe(false);
  });
  it("rejects non-phone characters", () => {
    expect(contactSchema.safeParse({ ...valid, phone: "<script>" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, phone: "+254 700 000 000" }).success).toBe(true);
  });
});
