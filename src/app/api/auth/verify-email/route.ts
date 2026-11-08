import { NextRequest, NextResponse } from "next/server";
import { db } from "@/services/db";
import { hashToken } from "@/services/auth/password";
import { rateLimit, getClientIp } from "@/services/auth/rateLimit";
import { appOrigin } from "@/services/auth/http";

export async function GET(req: NextRequest) {
  const { ok } = rateLimit(`verify-email:${getClientIp(req)}`, 20, 15 * 60 * 1000);
  if (!ok) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const token = req.nextUrl.searchParams.get("token");
  if (!token || token.length > 200) {
    return NextResponse.json({ error: "Missing verification token" }, { status: 400 });
  }

  const profile = await db.getProfileByVerificationTokenHash(hashToken(token));

  if (!profile) {
    return NextResponse.json({ error: "Invalid or expired verification link" }, { status: 400 });
  }

  await db.saveProfile({ ...profile, email_verified: true, verification_token: null });

  // Redirect to the configured site origin — never one derived from request headers.
  return NextResponse.redirect(new URL("/portal?verified=1", appOrigin(req)));
}
