import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/services/db";
import { Profile } from "@/services/db/types";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    const existing = await db.getProfileByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Email is already registered. Please login." }, { status: 400 });
    }

    const newId = "cust-" + Math.random().toString(36).substring(2, 9);
    const newProfile: Profile = {
      id: newId,
      name,
      email,
      phone,
      role: "customer",
      created_at: new Date().toISOString()
    };

    await db.saveProfile(newProfile);

    // Automatically set cookie session
    const cookieStore = await cookies();
    cookieStore.set("vistana_session", newId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ success: true, user: newProfile });
  } catch (e) {
    console.error("Register API error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
