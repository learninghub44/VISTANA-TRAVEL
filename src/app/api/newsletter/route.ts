import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/services/db";
import { rateLimitShared, getClientIp } from "@/services/auth/rateLimit";
import { verifyOrigin } from "@/services/auth/csrf";
import { readJson, badRequest } from "@/services/auth/http";
import { captureLeadSafe } from "@/services/leads";

export const schema = z.object({ email: z.string().trim().toLowerCase().email().max(254) });

export async function POST(req: NextRequest) {
  try {
    const csrfError = verifyOrigin(req);
    if (csrfError) return csrfError;

    const ip = getClientIp(req);
    const { ok } = await rateLimitShared(`newsletter:${ip}`, 5, 15 * 60 * 1000);
    if (!ok) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await readJson(req);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return badRequest("A valid email is required");
    }

    await db.addSubscriber(parsed.data.email);
    await captureLeadSafe({ email: parsed.data.email, source: "newsletter" });

    return NextResponse.json({ success: true, message: "You're subscribed! Watch your inbox for safari inspiration." });
  } catch (e) {
    console.error("Newsletter signup API error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
