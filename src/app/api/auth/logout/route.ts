import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/services/auth/session";

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Logout API error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
