import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/services/db";
import { hashPassword, hashToken, MAX_PASSWORD_LENGTH } from "@/services/auth/password";
import { rateLimit, getClientIp } from "@/services/auth/rateLimit";
import { verifyOrigin } from "@/services/auth/csrf";
import { readJson, badRequest } from "@/services/auth/http";

export const schema = z.object({
  token: z.string().min(10).max(200),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(MAX_PASSWORD_LENGTH, "Password is too long"),
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

    const body = await readJson(req);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || "Invalid request");
    }
    const { token, password } = parsed.data;

    // Indexed lookup by token hash — previously this loaded EVERY profile
    // (including all password hashes) into memory just to find one token.
    const profile = await db.getProfileByResetTokenHash(hashToken(token));

    if (!profile || !profile.reset_token_expires || new Date(profile.reset_token_expires) < new Date()) {
      return badRequest("This reset link is invalid or has expired");
    }

    const passwordHash = await hashPassword(password);
    await db.saveProfile({
      ...profile,
      password_hash: passwordHash,
      reset_token: null,
      reset_token_expires: null,
      // Receiving the emailed link proves mailbox ownership too.
      email_verified: true,
      verification_token: null,
      // Invalidates every session issued before this moment (see getVerifiedSession).
      password_changed_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Reset password API error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
