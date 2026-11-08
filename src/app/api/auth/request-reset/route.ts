import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/services/db";
import { generateToken, hashToken } from "@/services/auth/password";
import { rateLimit, getClientIp } from "@/services/auth/rateLimit";
import { sendPasswordResetEmail } from "@/services/email";
import { verifyOrigin } from "@/services/auth/csrf";
import { readJson, badRequest } from "@/services/auth/http";

export const schema = z.object({ email: z.string().trim().toLowerCase().email().max(254) });

export async function POST(req: NextRequest) {
  try {
    const csrfError = verifyOrigin(req);
    if (csrfError) return csrfError;

    const ip = getClientIp(req);
    const { ok } = rateLimit(`reset:${ip}`, 5, 15 * 60 * 1000);
    if (!ok) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await readJson(req);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return badRequest("A valid email is required");
    }

    const generic = NextResponse.json({
      success: true,
      message: "If that email is registered, a reset link has been sent.",
    });

    // Per-address cap so nobody can use this endpoint to mail-bomb a victim.
    const perAccount = rateLimit(`reset-email:${parsed.data.email}`, 3, 60 * 60 * 1000);
    if (!perAccount.ok) return generic;

    const profile = await db.getProfileByEmail(parsed.data.email);

    // Always return the same response, whether or not the account exists, to
    // avoid leaking which emails are registered.
    if (profile) {
      const token = generateToken();
      const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
      await db.saveProfile({ ...profile, reset_token: hashToken(token), reset_token_expires: expires });
      await sendPasswordResetEmail(profile.email, profile.name, token);
    }

    return generic;
  } catch (e) {
    console.error("Request reset API error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
