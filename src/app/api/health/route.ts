import { NextResponse } from "next/server";
import { db } from "@/services/db";
import { classifyDbError } from "@/services/db/resilient";

export const dynamic = "force-dynamic";

// For uptime monitors / Cloudflare health checks. 200 = site + database
// reachable, 503 = database problem. `reason` is a coarse category only
// (unreachable | permission_denied | missing_tables | bad_key | unknown) —
// never a message, host or key.
export async function GET() {
  try {
    await db.getSiteSettings();
    return NextResponse.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json(
      { status: "degraded", reason: classifyDbError(e) },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
