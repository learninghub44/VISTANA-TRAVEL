import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/services/db";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const profile = await db.getProfileByEmail(email);

    if (!profile) {
      return NextResponse.json({ error: "Account not found. Please register." }, { status: 404 });
    }

    // Special check for admin credentials
    if (profile.email.toLowerCase() === "admin@vistana.com" && password !== "admin") {
      return NextResponse.json({ error: "Invalid admin password. Use 'admin'" }, { status: 401 });
    }

    // Set cookie session (lasts for 7 days)
    const cookieStore = await cookies();
    cookieStore.set("vistana_session", profile.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true, user: profile });
  } catch (e) {
    console.error("Login API error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
