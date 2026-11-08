import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/services/db";
import { rateLimit, getClientIp } from "@/services/auth/rateLimit";
import { verifyOrigin } from "@/services/auth/csrf";
import { readJson, badRequest } from "@/services/auth/http";
import { sendInquiryNotificationEmail } from "@/services/email";

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: z.string().trim().max(24).regex(/^[0-9+()\-\s]*$/, "Invalid phone number").optional(),
  subject: z.string().trim().min(3).max(150),
  message: z.string().trim().min(10, "Please tell us a little more (at least 10 characters)").max(3000),
  // Honeypot: hidden from real visitors; bots that auto-fill every field trip it.
  website: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const csrfError = verifyOrigin(req);
    if (csrfError) return csrfError;

    const ip = getClientIp(req);
    if (!rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000).ok) {
      return NextResponse.json(
        { error: "Too many messages from your connection. Please try again later or reach us on WhatsApp." },
        { status: 429 }
      );
    }

    const body = await readJson(req);
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message || "Please check your details and try again.");
    }

    // Pretend success to bots without storing or emailing anything.
    if (parsed.data.website) {
      return NextResponse.json({ success: true });
    }

    if (!rateLimit(`contact-email:${parsed.data.email}`, 3, 60 * 60 * 1000).ok) {
      return NextResponse.json({ error: "We already have your recent messages — we'll reply soon." }, { status: 429 });
    }

    const { name, email, phone, subject, message } = parsed.data;
    const saved = await db.saveInquiry({ name, email, phone, subject, message });

    // Notify the office by email, but never fail the visitor's request over it —
    // the inquiry is already safely stored and visible in /admin/inquiries.
    try {
      const settings = await db.getSiteSettings();
      const to = settings.office_email || process.env.CONTACT_NOTIFY_EMAIL;
      if (to) await sendInquiryNotificationEmail(to, { name, email, phone, subject, message });
    } catch (e) {
      console.error("Inquiry notification email failed:", e);
    }

    return NextResponse.json({ success: true, id: saved.id });
  } catch (e) {
    console.error("Contact API error:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again or contact us on WhatsApp." }, { status: 500 });
  }
}
