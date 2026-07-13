import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("vistana_session");
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Logout API error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
