/* eslint-disable @typescript-eslint/no-explicit-any -- dummy payloads below only need to satisfy the compiler; every gated action returns before touching them */
import { describe, it, expect, vi } from "vitest";

// Every gated action checks the session BEFORE touching its payload (see
// src/app/actions/index.ts), so we can call each with a minimal dummy
// payload and only care that it's rejected before any real work happens.
// Mocking next/headers so cookies() has no session cookie makes
// getSession() resolve to null for every call below, without needing a
// real request context.
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => undefined,
    set: () => {},
    delete: () => {},
  }),
  headers: async () => ({
    get: () => null,
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: () => {},
  updateTag: () => {},
  unstable_cache: (fn: (...args: any[]) => any) => fn,
}));

process.env.SESSION_SECRET = "test-session-secret-at-least-32-chars-long";

import { db } from "@/services/db";
import {
  updateLeadAction,
  deleteLeadAction,
  setAdminRoleAction,
  updateProfileAction,
  changePasswordAction,
  requestQuoteAction,
  updateMeetingStatusAction,
  deleteMeetingAction,
  requestMeetingAction,
  updateInquiryStatusAction,
  deleteInquiryAction,
  updateBookingStatusAction,
  saveTourAction,
  deleteTourAction,
  saveDestinationAction,
  deleteDestinationAction,
  saveGuideAction,
  deleteGuideAction,
  saveVehicleAction,
  deleteVehicleAction,
  saveHotelAction,
  deleteHotelAction,
  updateReviewStatusAction,
  deleteReviewAction,
  saveBlogAction,
  deleteBlogAction,
  saveTestimonialAction,
  deleteTestimonialAction,
  savePartnerAction,
  deletePartnerAction,
  saveFaqAction,
  deleteFaqAction,
  saveGalleryImageAction,
  deleteGalleryImageAction,
  saveSocialPostAction,
  deleteSocialPostAction,
  createBookingAction,
  submitReviewAction,
  toggleFavoriteTourAction,
} from "./index";

describe("admin-gated actions reject unauthenticated calls", () => {
  const cases: [string, () => Promise<{ success: boolean; error?: string }>][] = [
    ["updateBookingStatusAction", () => updateBookingStatusAction("dummy-id", {} as any)],
    ["saveTourAction", () => saveTourAction({} as any)],
    ["deleteTourAction", () => deleteTourAction("dummy-id")],
    ["saveDestinationAction", () => saveDestinationAction({} as any)],
    ["deleteDestinationAction", () => deleteDestinationAction("dummy-id")],
    ["saveGuideAction", () => saveGuideAction({} as any)],
    ["deleteGuideAction", () => deleteGuideAction("dummy-id")],
    ["saveVehicleAction", () => saveVehicleAction({} as any)],
    ["deleteVehicleAction", () => deleteVehicleAction("dummy-id")],
    ["saveHotelAction", () => saveHotelAction({} as any)],
    ["deleteHotelAction", () => deleteHotelAction("dummy-id")],
    ["updateReviewStatusAction", () => updateReviewStatusAction("dummy-id", "Approved")],
    ["deleteReviewAction", () => deleteReviewAction("dummy-id")],
    ["saveBlogAction", () => saveBlogAction({} as any)],
    ["deleteBlogAction", () => deleteBlogAction("dummy-id")],
    ["saveTestimonialAction", () => saveTestimonialAction({} as any)],
    ["deleteTestimonialAction", () => deleteTestimonialAction("dummy-id")],
    ["savePartnerAction", () => savePartnerAction({} as any)],
    ["deletePartnerAction", () => deletePartnerAction("dummy-id")],
    ["saveFaqAction", () => saveFaqAction({} as any)],
    ["deleteFaqAction", () => deleteFaqAction("dummy-id")],
    ["saveGalleryImageAction", () => saveGalleryImageAction({} as any)],
    ["deleteGalleryImageAction", () => deleteGalleryImageAction("dummy-id")],
    ["saveSocialPostAction", () => saveSocialPostAction({} as any)],
    ["deleteSocialPostAction", () => deleteSocialPostAction("dummy-id")],
  ];

  it.each(cases)("%s rejects with success: false when there is no admin session", async (_name, fn) => {
    const result = await fn();
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/unauthorized/i);
  });
});

describe("customer-gated actions reject unauthenticated calls", () => {
  const cases: [string, () => Promise<{ success: boolean; error?: string }>][] = [
    ["createBookingAction", () => createBookingAction({} as any)],
    ["toggleFavoriteTourAction", () => toggleFavoriteTourAction("dummy-tour-id")],
  ];

  it.each(cases)("%s rejects when there is no customer session", async (_name, fn) => {
    const result = await fn();
    expect(result.success).toBe(false);
  });
});

describe("submitReviewAction (intentionally allows guest submissions)", () => {
  it("accepts a review with no session, defaulting to Anonymous Traveler, always Pending", async () => {
    const [realTour] = await db.getTours();
    const result = await submitReviewAction({
      tour_id: realTour.id,
      customer_name: "",
      rating: 5,
      content: "Great trip!",
    } as any);
    expect(result.success).toBe(true);
    expect(result.review?.status).toBe("Pending");
  });
});

describe("submitReviewAction tour validation", () => {
  it("rejects a review for a tour that does not exist", async () => {
    const result = await submitReviewAction({
      tour_id: "no-such-tour",
      customer_name: "",
      rating: 5,
      content: "Great trip!",
    } as any);
    expect(result.success).toBe(false);
  });
});

describe("new admin/customer-gated actions reject unauthenticated callers", () => {
  it("updateInquiryStatusAction", async () => {
    const r = await updateInquiryStatusAction("x", "Replied");
    expect(r.success).toBe(false);
  });
  it("deleteInquiryAction", async () => {
    const r = await deleteInquiryAction("x");
    expect(r.success).toBe(false);
  });
  it("createBookingAction", async () => {
    const r = await createBookingAction({ tourId: "x", startDate: "2030-01-01", endDate: "2030-01-05", adults: 1, children: 0 });
    expect(r.success).toBe(false);
  });
});

describe("meeting actions", () => {
  it("admin-only meeting actions reject unauthenticated callers", async () => {
    expect((await updateMeetingStatusAction("x", "Confirmed")).success).toBe(false);
    expect((await deleteMeetingAction("x")).success).toBe(false);
  });
  it("requestMeetingAction rejects invalid slots and details", async () => {
    const base = { name: "Amina W", email: "amina@example.com", topic: "Honeymoon safari", channel: "Video call" as const, preferred_time: "10:00" };
    expect((await requestMeetingAction({ ...base, preferred_date: "2020-01-01" })).success).toBe(false);
    expect((await requestMeetingAction({ ...base, email: "nope", preferred_date: "2099-01-01" })).success).toBe(false);
  });
  it("requestMeetingAction silently drops honeypot submissions without storing anything", async () => {
    const before = (await db.getMeetings()).length;
    const r = await requestMeetingAction({ name: "Bot", email: "bot@example.com", topic: "spam spam", channel: "Video call", preferred_date: "2099-01-01", preferred_time: "10:00", website: "http://spam" });
    expect(r.success).toBeDefined();
    expect((await db.getMeetings()).length).toBe(before);
  });
});

describe("leads, team and account actions", () => {
  it("reject unauthenticated callers", async () => {
    expect((await updateLeadAction("x", { status: "Won" })).success).toBe(false);
    expect((await deleteLeadAction("x")).success).toBe(false);
    expect((await setAdminRoleAction("a@b.com", true)).success).toBe(false);
    expect((await updateProfileAction({ name: "Jane Doe" })).success).toBe(false);
    expect((await changePasswordAction({ current: "old-password", next: "new-password-1" })).success).toBe(false);
  });
  it("requestQuoteAction validates input, rejects unknown tours, and drops honeypot posts", async () => {
    const base = { name: "Amina W", email: "amina@example.com", tour_slug: "no-such-tour", adults: 2, children: 0 };
    expect((await requestQuoteAction({ ...base, email: "nope" })).success).toBe(false);
    expect((await requestQuoteAction(base)).success).toBe(false);
    const before = (await db.getLeads()).length;
    const bot = await requestQuoteAction({ ...base, website: "http://spam" });
    expect(bot.success).toBe(true);
    expect((await db.getLeads()).length).toBe(before);
  });
  it("captures a real quote as one lead per email, counting repeat contacts", async () => {
    const [tour] = await db.getTours();
    const input = { name: "Lead Tester", email: `lead-${Date.now()}@example.com`, tour_slug: tour.slug, adults: 2, children: 0 };
    expect((await requestQuoteAction(input)).success).toBe(true);
    expect((await requestQuoteAction(input)).success).toBe(true);
    const mine = (await db.getLeads()).filter((l) => l.email === input.email);
    expect(mine).toHaveLength(1);
    expect(mine[0].touches).toBe(2);
    expect(mine[0].source).toBe("quote");
  });
});
