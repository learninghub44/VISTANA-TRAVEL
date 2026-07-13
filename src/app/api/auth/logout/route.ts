import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/services/auth/session";
import { verifyOrigin } from "@/services/auth/csrf";

export async function POST(req: NextRequest) {
  try {
    const csrfError = verifyOrigin(req);
    if (csrfError) return csrfError;

    await clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Logout API error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
