import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/services/db";
import { hashPassword } from "@/services/auth/password";
import { rateLimit, getClientIp } from "@/services/auth/rateLimit";
import { verifyOrigin } from "@/services/auth/csrf";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const csrfError = verifyOrigin(req);
    if (csrfError) return csrfError;

    const ip = getClientIp(req);
    const { ok } = rateLimit(`reset-confirm:${ip}`, 10, 15 * 60 * 1000);
    if (!ok) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid request" },
        { status: 400 }
      );
    }
    const { token, password } = parsed.data;

    const profiles = await db.getProfiles();
    const profile = profiles.find((p) => p.reset_token === token);

    if (!profile || !profile.reset_token_expires || new Date(profile.reset_token_expires) < new Date()) {
      return NextResponse.json({ error: "This reset link is invalid or has expired" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    await db.saveProfile({
      ...profile,
      password_hash: passwordHash,
      reset_token: null,
      reset_token_expires: null,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Reset password API error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
