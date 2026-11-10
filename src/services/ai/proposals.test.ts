import { describe, it, expect } from "vitest";
import { buildBookingProposal, buildMeetingProposal } from "./proposals";
import type { Tour } from "@/services/db/types";

const tour = { id: "t1", slug: "mara-5d", title: "5-Day Mara", price_usd: 1000, duration_days: 5, min_guests: 2, max_guests: 6 } as Tour;
const TODAY = "2027-03-01";

describe("buildBookingProposal", () => {
  it("builds a proposal with computed end date and total", () => {
    const r = buildBookingProposal(tour, { start_date: "2027-04-10", adults: 2, children: 2 }, TODAY);
    expect(r.ok && r.proposal).toMatchObject({ endDate: "2027-04-14", estimatedTotalUsd: 3000, tourId: "t1" });
  });
  it("rejects unknown tours, bad/past dates, and bad guest counts", () => {
    expect(buildBookingProposal(null, {}, TODAY).ok).toBe(false);
    expect(buildBookingProposal(tour, { start_date: "next friday", adults: 2 }, TODAY).ok).toBe(false);
    expect(buildBookingProposal(tour, { start_date: "2027-01-01", adults: 2 }, TODAY).ok).toBe(false);
    expect(buildBookingProposal(tour, { start_date: "2027-04-10", adults: 0 }, TODAY).ok).toBe(false);
    expect(buildBookingProposal(tour, { start_date: "2027-04-10", adults: 1.5 }, TODAY).ok).toBe(false);
  });
  it("enforces the tour's group limits", () => {
    expect(buildBookingProposal(tour, { start_date: "2027-04-10", adults: 7 }, TODAY).ok).toBe(false);
    expect(buildBookingProposal(tour, { start_date: "2027-04-10", adults: 1 }, TODAY).ok).toBe(false);
  });
});

describe("buildMeetingProposal", () => {
  const NOW = Date.parse("2027-03-01T06:00:00Z");
  it("accepts a valid slot and defaults the channel", () => {
    const r = buildMeetingProposal({ topic: "Honeymoon planning", preferred_date: "2027-03-03", preferred_time: "10:00" }, NOW);
    expect(r.ok && r.proposal.channel).toBe("Video call");
  });
  it("rejects missing topics and bad slots", () => {
    expect(buildMeetingProposal({ topic: "", preferred_date: "2027-03-03", preferred_time: "10:00" }, NOW).ok).toBe(false);
    expect(buildMeetingProposal({ topic: "Plan", preferred_date: "2027-03-03", preferred_time: "22:00" }, NOW).ok).toBe(false);
  });
});
