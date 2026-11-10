import { db } from "@/services/db";
import type { LeadCapture } from "@/services/db/types";

/**
 * Records a lead without ever affecting the visitor's request: a database hiccup
 * (or the leads table not existing yet) must never make a contact form, signup
 * or booking fail. Errors are logged and swallowed.
 */
export async function captureLeadSafe(input: LeadCapture): Promise<void> {
  try {
    await db.captureLead(input);
  } catch (e) {
    console.error("Lead capture failed:", e);
  }
}
