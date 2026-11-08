import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/services/db";
import { Profile } from "@/services/db/types";
import { hashPassword, generateToken, hashToken, MAX_PASSWORD_LENGTH } from "@/services/auth/password";
import { setSessionCookie } from "@/services/auth/session";
import { rateLimit, getClientIp } from "@/services/auth/rateLimit";
import { sendVerificationEmail } from "@/services/email";
import { verifyOrigin } from "@/services/auth/csrf";
import { readJson, badRequest } from "@/services/auth/http";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: z.string().trim().max(24).regex(/^[0-9+()\-\s]*$/, "Invalid phone number").optional(),
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
    const { ok } = rateLimit(`register:${ip}`, 5, 15 * 60 * 1000); // 5 registrations / 15 min per IP
    if (!ok) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await readJson(req);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || "Invalid registration details");
    }
    const { name, email, phone, password } = parsed.data;

    const existing = await db.getProfileByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Email is already registered. Please login." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = generateToken();
    const newId = crypto.randomUUID();

    const newProfile: Profile = {
      id: newId,
      name,
      email,
      phone,
      role: "customer",
      password_hash: passwordHash,
      email_verified: false,
      // Only the hash is stored; the raw token goes in the email.
      verification_token: hashToken(verificationToken),
      created_at: new Date().toISOString(),
    };

    await db.saveProfile(newProfile);
    await sendVerificationEmail(email, name, verificationToken);

    await setSessionCookie({ sub: newId, role: "customer", email: newProfile.email });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, reset_token, verification_token: _vt, ...safeProfile } = newProfile;

    return NextResponse.json({ success: true, user: safeProfile });
  } catch (e) {
    console.error("Register API error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
