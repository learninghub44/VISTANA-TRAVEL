import { NextRequest, NextResponse } from "next/server";
import { db } from "@/services/db";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing verification token" }, { status: 400 });
  }

  const profiles = await db.getProfiles();
  const profile = profiles.find((p) => p.verification_token === token);

  if (!profile) {
    return NextResponse.json({ error: "Invalid or expired verification link" }, { status: 400 });
  }

  await db.saveProfile({ ...profile, email_verified: true, verification_token: null });

  return NextResponse.redirect(new URL("/portal?verified=1", req.url));
}
