import { NextResponse } from "next/server";
import { db } from "@/services/db";
import { getSession, clearSessionCookie } from "@/services/auth/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const profile = await db.getProfileById(session.sub);
    if (!profile) {
      await clearSessionCookie();
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { password_hash, reset_token, verification_token, ...safeProfile } = profile;
    return NextResponse.json({ authenticated: true, user: safeProfile });
  } catch (e) {
    console.error("Auth session API error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
