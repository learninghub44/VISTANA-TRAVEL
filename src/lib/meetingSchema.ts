import { z } from "zod";

export const MEETING_CHANNELS = ["Video call", "Phone call", "WhatsApp call", "Office visit"] as const;
export type MeetingChannel = (typeof MEETING_CHANNELS)[number];

const EAT_OFFSET_MS = 3 * 60 * 60 * 1000; // East Africa Time, UTC+3, no DST

/** Today's date (YYYY-MM-DD) in East Africa Time. */
export function todayEAT(now: number = Date.now()): string {
  return new Date(now + EAT_OFFSET_MS).toISOString().slice(0, 10);
}

export function isValidMeetingSlot(date: string, time: string, now: number = Date.now()): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(`${date}T00:00:00Z`).getTime())) return "Choose a valid date.";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return "Choose a valid time.";
  if (time < "08:00" || time > "18:00") return "We hold meetings between 08:00 and 18:00 (East Africa Time).";
  const slot = Date.parse(`${date}T${time}:00Z`) - EAT_OFFSET_MS; // slot expressed in real UTC time
  if (slot < now + 2 * 60 * 60 * 1000) return "Please pick a time at least 2 hours from now.";
  if (slot > now + 60 * 24 * 60 * 60 * 1000) return "Meetings can be booked up to 60 days ahead.";
  return null;
}

export const meetingSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: z.string().trim().max(24).regex(/^[0-9+()\-\s]*$/, "Invalid phone number").optional(),
  topic: z.string().trim().min(3, "Tell us briefly what you'd like to discuss").max(300),
  channel: z.enum(MEETING_CHANNELS),
  preferred_date: z.string(),
  preferred_time: z.string(),
  notes: z.string().trim().max(1500).optional(),
  tour_slug: z.string().max(140).optional(),
  // honeypot
  website: z.string().max(200).optional(),
});
export type MeetingInput = z.infer<typeof meetingSchema>;
