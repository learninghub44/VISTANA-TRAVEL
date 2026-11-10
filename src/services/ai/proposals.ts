import type { Tour } from "@/services/db/types";
import { computeBookingTotal, endDateFor } from "@/lib/pricing";
import { MEETING_CHANNELS, isValidMeetingSlot, type MeetingChannel } from "@/lib/meetingSchema";

/**
 * What the AI can "do": it can only PROPOSE. A proposal is shown to the
 * customer as a card with a Confirm button; nothing is booked or scheduled
 * until the customer confirms, and the real server actions re-validate
 * everything again. This also means a prompt-injected model can never create
 * a booking or meeting by itself.
 */
export interface BookingProposal {
  type: "booking";
  tourId: string;
  tourSlug: string;
  tourTitle: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  estimatedTotalUsd: number;
}

export interface MeetingProposal {
  type: "meeting";
  topic: string;
  channel: MeetingChannel;
  preferredDate: string;
  preferredTime: string;
  tourSlug?: string;
}

export type AssistantProposal = BookingProposal | MeetingProposal;

export function buildBookingProposal(
  tour: Tour | null,
  input: { start_date?: unknown; adults?: unknown; children?: unknown },
  todayISO: string
): { ok: true; proposal: BookingProposal } | { ok: false; error: string } {
  if (!tour) return { ok: false, error: "No tour found with that slug." };

  const start = String(input.start_date ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || Number.isNaN(new Date(`${start}T00:00:00Z`).getTime())) {
    return { ok: false, error: "start_date must be a real date in YYYY-MM-DD format. Ask the customer for it." };
  }
  if (start < todayISO) return { ok: false, error: "That start date is in the past. Ask for a future date." };

  const adults = Number(input.adults ?? 1);
  const children = Number(input.children ?? 0);
  if (!Number.isInteger(adults) || adults < 1 || !Number.isInteger(children) || children < 0) {
    return { ok: false, error: "Guest numbers must be whole numbers with at least 1 adult." };
  }
  const guests = adults + children;
  if (tour.max_guests > 0 && guests > tour.max_guests) {
    return { ok: false, error: `This tour takes at most ${tour.max_guests} guests. Suggest a smaller group or a meeting with the team.` };
  }
  if (tour.min_guests > 0 && guests < tour.min_guests) {
    return { ok: false, error: `This tour needs at least ${tour.min_guests} guests.` };
  }

  return {
    ok: true,
    proposal: {
      type: "booking",
      tourId: tour.id,
      tourSlug: tour.slug,
      tourTitle: tour.title,
      startDate: start,
      endDate: endDateFor(start, tour.duration_days),
      adults,
      children,
      estimatedTotalUsd: computeBookingTotal(tour.price_usd, adults, children),
    },
  };
}

export function buildMeetingProposal(
  input: { topic?: unknown; channel?: unknown; preferred_date?: unknown; preferred_time?: unknown; tour_slug?: unknown },
  now: number = Date.now()
): { ok: true; proposal: MeetingProposal } | { ok: false; error: string } {
  const topic = String(input.topic ?? "").trim().slice(0, 300);
  if (topic.length < 3) return { ok: false, error: "Ask the customer what the meeting is about." };

  const channel = MEETING_CHANNELS.find((c) => c === input.channel) ?? "Video call";
  const date = String(input.preferred_date ?? "");
  const time = String(input.preferred_time ?? "");
  const slotError = isValidMeetingSlot(date, time, now);
  if (slotError) return { ok: false, error: slotError };

  return {
    ok: true,
    proposal: {
      type: "meeting",
      topic,
      channel,
      preferredDate: date,
      preferredTime: time,
      tourSlug: typeof input.tour_slug === "string" && input.tour_slug ? input.tour_slug.slice(0, 140) : undefined,
    },
  };
}
