import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/services/auth/rateLimit";
import { verifyOrigin } from "@/services/auth/csrf";
import { runAssistant } from "@/services/ai/assistant";

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(20),
});

export async function POST(req: NextRequest) {
  try {
    const csrfError = verifyOrigin(req);
    if (csrfError) return csrfError;

    const ip = getClientIp(req);
    const { ok } = rateLimit(`assistant:${ip}`, 20, 10 * 60 * 1000);
    if (!ok) {
      return NextResponse.json(
        { error: "Too many messages. Please wait a moment or reach us on WhatsApp." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const result = await runAssistant(parsed.data.messages);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 200 });
    }

    return NextResponse.json({ reply: result.reply });
  } catch (e) {
    console.error("AI assistant API error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
