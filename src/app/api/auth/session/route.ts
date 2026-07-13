import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/services/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("vistana_session")?.value;

    if (!sessionId) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const profile = await db.getProfileById(sessionId);
    if (!profile) {
      // Clear invalid cookie
      const response = NextResponse.json({ authenticated: false }, { status: 401 });
      response.cookies.delete("vistana_session");
      return response;
    }

    return NextResponse.json({ authenticated: true, user: profile });
  } catch (e) {
    console.error("Auth session API error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
