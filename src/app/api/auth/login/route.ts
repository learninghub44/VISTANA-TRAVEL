import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/services/db";
import { verifyPasswordConstantTime, MAX_PASSWORD_LENGTH } from "@/services/auth/password";
import { setSessionCookie } from "@/services/auth/session";
import { rateLimitShared, getClientIp } from "@/services/auth/rateLimit";
import { ensureAdminSeeded } from "@/services/auth/bootstrap";
import { verifyOrigin } from "@/services/auth/csrf";
import { readJson, badRequest } from "@/services/auth/http";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(MAX_PASSWORD_LENGTH),
});

export async function POST(req: NextRequest) {
  try {
    const csrfError = verifyOrigin(req);
    if (csrfError) return csrfError;

    const ip = getClientIp(req);
    const { ok } = await rateLimitShared(`login:${ip}`, 10, 15 * 60 * 1000); // 10 attempts / 15 min per IP
    if (!ok) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const body = await readJson(req);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("A valid email and password are required");
    }
    const { email, password } = parsed.data;

    // Second limiter keyed on the account, so a botnet rotating IPs can't
    // brute-force one customer's password (the per-IP limit alone can't stop that).
    const perAccount = await rateLimitShared(`login-email:${email}`, 8, 15 * 60 * 1000);
    if (!perAccount.ok) {
      return NextResponse.json(
        { error: "Too many login attempts for this account. Please try again later or reset your password." },
        { status: 429 }
      );
    }

    await ensureAdminSeeded();

    const profile = await db.getProfileByEmail(email);

    // Always run a full password hash (against a dummy when the account is
    // missing) and return one generic error, so neither the message nor the
    // response time reveals whether an email is registered.
    const validPassword = await verifyPasswordConstantTime(password, profile?.password_hash);
    if (!profile || !validPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    await setSessionCookie({ sub: profile.id, role: profile.role, email: profile.email });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, reset_token, verification_token, ...safeProfile } = profile;

    return NextResponse.json({ success: true, user: safeProfile });
  } catch (e) {
    console.error("Login API error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
