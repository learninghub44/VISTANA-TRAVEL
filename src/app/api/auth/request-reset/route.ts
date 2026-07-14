import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/services/db";
import { generateToken } from "@/services/auth/password";
import { rateLimit, getClientIp } from "@/services/auth/rateLimit";
import { sendPasswordResetEmail } from "@/services/email";
import { verifyOrigin } from "@/services/auth/csrf";

export const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  try {
    const csrfError = verifyOrigin(req);
    if (csrfError) return csrfError;

    const ip = getClientIp(req);
    const { ok } = rateLimit(`reset:${ip}`, 5, 15 * 60 * 1000);
    if (!ok) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    const profile = await db.getProfileByEmail(parsed.data.email);

    // Always return success, whether or not the account exists, to avoid
    // leaking which emails are registered.
    if (profile) {
      const token = generateToken();
      const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
      await db.saveProfile({ ...profile, reset_token: token, reset_token_expires: expires });
      await sendPasswordResetEmail(profile.email, profile.name, token);
    }

    return NextResponse.json({ success: true, message: "If that email is registered, a reset link has been sent." });
  } catch (e) {
    console.error("Request reset API error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
