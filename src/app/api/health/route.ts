import { NextResponse } from "next/server";
import { db } from "@/services/db";

export const dynamic = "force-dynamic";

// For uptime monitors / Cloudflare health checks. 200 = site + database
// reachable, 503 = database unreachable. Deliberately returns no details.
export async function GET() {
  try {
    await db.getSiteSettings();
    return NextResponse.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "degraded" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
