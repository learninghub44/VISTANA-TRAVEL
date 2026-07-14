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

import {
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
  uploadBookingDocumentAction,
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
    ["uploadBookingDocumentAction", () => uploadBookingDocumentAction(new FormData())],
    ["toggleFavoriteTourAction", () => toggleFavoriteTourAction("dummy-tour-id")],
  ];

  it.each(cases)("%s rejects when there is no customer session", async (_name, fn) => {
    const result = await fn();
    expect(result.success).toBe(false);
  });
});

describe("submitReviewAction (intentionally allows guest submissions)", () => {
  it("accepts a review with no session, defaulting to Anonymous Traveler, always Pending", async () => {
    const result = await submitReviewAction({
      tour_id: "dummy-tour-id",
      customer_name: "",
      rating: 5,
      content: "Great trip!",
    } as any);
    expect(result.success).toBe(true);
    expect(result.review?.status).toBe("Pending");
  });
});
