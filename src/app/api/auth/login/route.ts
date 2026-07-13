import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/services/db";
import { verifyPassword } from "@/services/auth/password";
import { setSessionCookie } from "@/services/auth/session";
import { rateLimit, getClientIp } from "@/services/auth/rateLimit";
import { ensureAdminSeeded } from "@/services/auth/bootstrap";
import { verifyOrigin } from "@/services/auth/csrf";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const csrfError = verifyOrigin(req);
    if (csrfError) return csrfError;

    const ip = getClientIp(req);
    const { ok } = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000); // 10 attempts / 15 min per IP
    if (!ok) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "A valid email and password are required" }, { status: 400 });
    }
    const { email, password } = parsed.data;

    await ensureAdminSeeded();

    const profile = await db.getProfileByEmail(email);

    // Generic error message regardless of whether the account exists — avoids
    // leaking which emails are registered (user enumeration).
    const genericError = () =>
      NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    if (!profile || !profile.password_hash) {
      return genericError();
    }

    const validPassword = await verifyPassword(password, profile.password_hash);
    if (!validPassword) {
      return genericError();
    }

    await setSessionCookie({ sub: profile.id, role: profile.role, email: profile.email });

    const { password_hash, reset_token, verification_token, ...safeProfile } = profile;

    return NextResponse.json({ success: true, user: safeProfile });
  } catch (e) {
    console.error("Login API error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
