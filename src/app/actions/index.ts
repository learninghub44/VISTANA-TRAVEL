"use server";

import { db } from "@/services/db";
import { storage } from "@/services/storage";
import { sendBookingConfirmationEmail, sendBookingStatusUpdateEmail } from "@/services/email";
import { whatsapp } from "@/services/whatsapp";
import { Booking, Tour, Destination, Guide, Vehicle, Hotel, Blog, Review, Profile, Testimonial, Partner, Faq, GalleryImage, SocialPost } from "@/services/db/types";
import { getVerifiedSession, setSessionCookie } from "@/services/auth/session";
import { hashPassword, verifyPasswordConstantTime, MAX_PASSWORD_LENGTH } from "@/services/auth/password";
import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/services/db/cached";
import { rateLimitShared, getClientIpFromHeaders } from "@/services/auth/rateLimit";
import { sniffFileType, extensionFor } from "@/lib/fileSniff";
import { tourSchema, slugify, uniqueSlug } from "@/lib/tourSchema";
import { computeBookingTotal } from "@/lib/pricing";
import { meetingSchema, isValidMeetingSlot } from "@/lib/meetingSchema";
import { sendMeetingEmails, sendInquiryNotificationEmail } from "@/services/email";
import { captureLeadSafe } from "@/services/leads";
import { quoteSchema, leadUpdateSchema } from "@/lib/leadSchema";
import { checkRoleChange } from "@/lib/roles";
import { headers } from "next/headers";
import { z } from "zod";

// Server actions don't receive a Request object, so pull the client IP from
// the forwarded headers the same way src/services/auth/rateLimit.ts does for
// API routes. Used to rate-limit actions reachable without authentication
// (e.g. anonymous review submission).
async function getActionClientIp(): Promise<string> {
  return getClientIpFromHeaders(await headers());
}

const uuidLike = z.string().min(1).max(100);

// Auth helpers for server actions. Both go through getVerifiedSession(), which
// re-checks the live profile (exists, role unchanged, password not reset since
// login) instead of trusting the JWT's claims alone.
async function getAdminSession(): Promise<Profile | null> {
  const verified = await getVerifiedSession();
  if (!verified || verified.profile.role !== "admin") return null;
  return verified.profile;
}

async function getCustomerSession(): Promise<Profile | null> {
  const verified = await getVerifiedSession();
  return verified ? verified.profile : null;
}

// Fire-and-forget audit trail for admin mutations. Never blocks or fails
// the calling action — logging errors are swallowed and console-logged.
async function logAudit(
  admin: Profile,
  action: string,
  entityType: string,
  entityId?: string,
  details?: string
) {
  try {
    await db.addAuditLog({
      actor_id: admin.id,
      actor_name: admin.name,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
    });
  } catch (e) {
    console.error("Audit log error:", e);
  }
}

// ----------------------------------------------------
// Image Upload Action
// ----------------------------------------------------
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB

// Admin-only (used by GalleryManager/SocialFeedManager). Previously this had
// no auth check, no rate limit, and no mime/size validation at all — any
// unauthenticated caller could invoke it directly with an arbitrarily large
// or malicious file.
export async function uploadImageAction(formData: FormData): Promise<{ url: string; error?: string }> {
  const admin = await getAdminSession();
  if (!admin) throw new Error("Unauthorized. Admin permissions required.");

  const limited = await rateLimitShared(`upload-image:${admin.id}`, 30, 60 * 60 * 1000);
  if (!limited.ok) throw new Error("Too many uploads. Please try again later.");

  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file uploaded");
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Unsupported file type. Please upload a JPG, PNG, WEBP, or GIF image.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("File is too large. Maximum size is 8MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  // Trust the file's bytes, not the client-supplied Content-Type.
  const sniffed = sniffFileType(buffer);
  if (!sniffed || !ALLOWED_IMAGE_TYPES.has(sniffed)) {
    throw new Error("That file isn't a valid JPG, PNG, WEBP, or GIF image.");
  }
  const url = await storage.uploadImage(buffer, `upload.${extensionFor(sniffed)}`, sniffed);
  return { url };
}

// ----------------------------------------------------
// Booking Actions
// ----------------------------------------------------
const createBookingSchema = z.object({
  tourId: uuidLike,
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date"),
  adults: z.number().int().min(1).max(50),
  children: z.number().int().min(0).max(50),
  specialRequests: z.string().max(2000).optional(),
});

const DAY_MS = 24 * 60 * 60 * 1000;

export async function createBookingAction(data: {
  tourId: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  specialRequests?: string;
}): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  try {
    const customer = await getCustomerSession();
    if (!customer) {
      return { success: false, error: "Please log in to make a booking." };
    }

    const limited = await rateLimitShared(`create-booking:${customer.id}`, 20, 60 * 60 * 1000);
    if (!limited.ok) {
      return { success: false, error: "Too many booking requests. Please try again later." };
    }

    const parsed = createBookingSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Invalid booking details." };
    }
    data = parsed.data;

    const start = new Date(`${data.startDate}T00:00:00Z`);
    const end = new Date(`${data.endDate}T00:00:00Z`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return { success: false, error: "Invalid travel dates." };
    }
    const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
    if (start < today) {
      return { success: false, error: "Start date cannot be in the past." };
    }
    if (end < start) {
      return { success: false, error: "End date cannot be before start date." };
    }
    if (start.getTime() - today.getTime() > 730 * DAY_MS) {
      return { success: false, error: "Bookings can only be made up to 2 years in advance." };
    }

    const tour = await db.getTourById(data.tourId);
    if (!tour) {
      return { success: false, error: "Selected tour package not found." };
    }

    // Enforce the tour's own group-size limits server-side — the form's
    // constraints are only a UX hint and can be bypassed by calling the action directly.
    const guests = data.adults + data.children;
    if (tour.max_guests > 0 && guests > tour.max_guests) {
      return { success: false, error: `This tour accepts at most ${tour.max_guests} guests. Please contact us for larger groups.` };
    }
    if (tour.min_guests > 0 && guests < tour.min_guests) {
      return { success: false, error: `This tour requires at least ${tour.min_guests} guests.` };
    }

    // Price is always computed here from the database — never taken from the client.
    // Full price for adults, 50% for children; rounded to cents.
    const totalPrice = computeBookingTotal(tour.price_usd, data.adults, data.children);

    const newBooking: Omit<Booking, "id" | "created_at"> = {
      tour_id: data.tourId,
      customer_id: customer.id,
      start_date: data.startDate,
      end_date: data.endDate,
      adults: data.adults,
      children: data.children,
      special_requests: data.specialRequests,
      status: "Pending",
      total_price: totalPrice,
    };

    const saved = await db.saveBooking(newBooking);

    // Send notifications async (non-blocking)
    sendBookingConfirmationEmail(saved, tour, customer.email, customer.name).catch(console.error);
    if (customer.phone) {
      whatsapp.notifyBookingRequest(saved, tour, customer.phone, customer.name).catch(console.error);
    }

    revalidatePath("/portal");
    return { success: true, bookingId: saved.id };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to submit booking request." };
  }
}

export async function updateBookingStatusAction(
  bookingId: string,
  updates: {
    status: Booking["status"];
    guideId?: string;
    vehicleId?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized. Admin permissions required." };

    const validStatus = z.enum(["Pending", "Confirmed", "Awaiting Payment", "Paid", "Completed", "Cancelled", "Refunded"]);
    if (!uuidLike.safeParse(bookingId).success || !validStatus.safeParse(updates?.status).success) {
      return { success: false, error: "Invalid booking update." };
    }

    const booking = await db.getBookingById(bookingId);
    if (!booking) return { success: false, error: "Booking not found." };

    const tour = await db.getTourById(booking.tour_id);
    if (!tour) return { success: false, error: "Associated tour not found." };

    const updatedBooking: Booking = {
      ...booking,
      status: updates.status,
      guide_id: updates.guideId !== undefined ? updates.guideId : booking.guide_id,
      vehicle_id: updates.vehicleId !== undefined ? updates.vehicleId : booking.vehicle_id,
    };

    await db.saveBooking(updatedBooking);
    await logAudit(admin, "update_status", "booking", bookingId, `status → ${updates.status}`);

    // Notify Customer of Status Update
    const customer = await db.getProfileById(booking.customer_id);
    if (customer) {
      sendBookingStatusUpdateEmail(updatedBooking, tour, customer.email, customer.name).catch(console.error);
      if (customer.phone) {
        whatsapp.notifyBookingStatusChanged(updatedBooking, tour, customer.phone, customer.name).catch(console.error);
      }
    }

    revalidatePath("/admin/bookings");
    revalidatePath("/portal");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to update booking status." };
  }
}

// ----------------------------------------------------
// Tour Actions
// ----------------------------------------------------
export async function saveTourAction(tour: Omit<Tour, "id" | "created_at"> & { id?: string }): Promise<{ success: boolean; tour?: Tour; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized. Admin permissions required." };

    // Validate everything the admin form sends — previously this stored the raw
    // object (no price/duration/image checks, duplicate slugs possible).
    const parsed = tourSchema.safeParse(tour);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Please check the package details." };
    }
    const data = parsed.data;

    if (!(await db.getDestinations()).some((d) => d.id === data.destination_id)) {
      return { success: false, error: "The selected destination no longer exists." };
    }

    // Unique, URL-safe slug (an edited package may keep its own current slug).
    const existing = await db.getTours();
    const taken = new Set(existing.filter((t) => t.id !== data.id).map((t) => t.slug));
    const slug = uniqueSlug(slugify(data.slug || data.title), taken);

    const saved = await db.saveTour({ ...data, slug } as Omit<Tour, "id" | "created_at"> & { id?: string });
    await logAudit(admin, data.id ? "update" : "create", "tour", saved.id, saved.title);

    // Make the package visible everywhere right away: listing, detail page,
    // homepage featured tours, its destination page, and the sitemap.
    revalidatePath("/");
    revalidatePath("/tours");
    revalidatePath(`/tours/${saved.slug}`);
    revalidatePath("/destinations");
    revalidatePath("/sitemap.xml");
    updateTag(CACHE_TAGS.tours);
    return { success: true, tour: saved };
  } catch (e) {
    return { success: false, error: e instanceof Error && e.message ? e.message : "Failed to save tour package." };
  }
}

export async function deleteTourAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized. Admin permissions required." };

    await db.deleteTour(id);
    await logAudit(admin, "delete", "tour", id);
    revalidatePath("/");
    revalidatePath("/tours");
    revalidatePath("/sitemap.xml");
    updateTag(CACHE_TAGS.tours);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to delete tour package." };
  }
}

// ----------------------------------------------------
// Destination Actions
// ----------------------------------------------------
export async function saveDestinationAction(destination: Omit<Destination, "id" | "created_at"> & { id?: string }): Promise<{ success: boolean; destination?: Destination; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };

    const slug = destination.slug || destination.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const saved = await db.saveDestination({ ...destination, slug });
    await logAudit(admin, destination.id ? "update" : "create", "destination", saved.id, saved.name);

    revalidatePath("/destinations");
    revalidatePath(`/destinations/${saved.slug}`);
    updateTag(CACHE_TAGS.destinations);
    return { success: true, destination: saved };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to save destination." };
  }
}

export async function deleteDestinationAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };

    await db.deleteDestination(id);
    await logAudit(admin, "delete", "destination", id);
    revalidatePath("/destinations");
    updateTag(CACHE_TAGS.destinations);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to delete destination." };
  }
}

// ----------------------------------------------------
// Guide Actions
// ----------------------------------------------------
export async function saveGuideAction(guide: Omit<Guide, "id" | "created_at"> & { id?: string }): Promise<{ success: boolean; guide?: Guide; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };

    const saved = await db.saveGuide(guide);
    await logAudit(admin, guide.id ? "update" : "create", "guide", saved.id, saved.name);
    revalidatePath("/admin/guides");
    updateTag(CACHE_TAGS.guides);
    return { success: true, guide: saved };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to save guide." };
  }
}

export async function deleteGuideAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };

    await db.deleteGuide(id);
    await logAudit(admin, "delete", "guide", id);
    revalidatePath("/admin/guides");
    updateTag(CACHE_TAGS.guides);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to delete guide." };
  }
}

// ----------------------------------------------------
// Vehicle Actions
// ----------------------------------------------------
export async function saveVehicleAction(vehicle: Omit<Vehicle, "id" | "created_at"> & { id?: string }): Promise<{ success: boolean; vehicle?: Vehicle; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };

    const saved = await db.saveVehicle(vehicle);
    await logAudit(admin, vehicle.id ? "update" : "create", "vehicle", saved.id, `${saved.type} — ${saved.license_plate}`);
    revalidatePath("/admin/vehicles");
    updateTag(CACHE_TAGS.vehicles);
    return { success: true, vehicle: saved };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to save vehicle." };
  }
}

export async function deleteVehicleAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };

    await db.deleteVehicle(id);
    await logAudit(admin, "delete", "vehicle", id);
    revalidatePath("/admin/vehicles");
    updateTag(CACHE_TAGS.vehicles);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to delete vehicle." };
  }
}

// ----------------------------------------------------
// Hotel Actions
// ----------------------------------------------------
export async function saveHotelAction(hotel: Omit<Hotel, "id" | "created_at"> & { id?: string }): Promise<{ success: boolean; hotel?: Hotel; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };

    const saved = await db.saveHotel(hotel);
    await logAudit(admin, hotel.id ? "update" : "create", "hotel", saved.id, saved.name);
    revalidatePath("/admin/hotels");
    updateTag(CACHE_TAGS.hotels);
    return { success: true, hotel: saved };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to save hotel profile." };
  }
}

export async function deleteHotelAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };

    await db.deleteHotel(id);
    await logAudit(admin, "delete", "hotel", id);
    revalidatePath("/admin/hotels");
    updateTag(CACHE_TAGS.hotels);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to delete hotel." };
  }
}

// ----------------------------------------------------
// Review Actions
// ----------------------------------------------------
const submitReviewSchema = z.object({
  tour_id: uuidLike,
  customer_name: z.string().max(120).optional(),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(1).max(3000),
  images: z.array(z.string().url().refine((v) => /^https:\/\//i.test(v), "Images must use https")).max(10).optional(),
});

// Reachable without authentication by design (anonymous reviews are
// allowed), so this is rate-limited by IP rather than by account.
export async function submitReviewAction(review: Omit<Review, "id" | "created_at" | "status">): Promise<{ success: boolean; review?: Review; error?: string }> {
  try {
    const ip = await getActionClientIp();
    const limited = await rateLimitShared(`submit-review:${ip}`, 10, 60 * 60 * 1000);
    if (!limited.ok) {
      return { success: false, error: "Too many reviews submitted. Please try again later." };
    }

    const parsed = submitReviewSchema.safeParse(review);
    if (!parsed.success) {
      return { success: false, error: "Invalid review — please check the rating and content." };
    }

    // Reviews may only target a real tour.
    if (!(await db.getTourById(parsed.data.tour_id))) {
      return { success: false, error: "Tour not found." };
    }

    const customer = await getCustomerSession();
    const customerName = customer ? customer.name : parsed.data.customer_name || "Anonymous Traveler";

    const saved = await db.saveReview({
      ...parsed.data,
      customer_name: customerName,
      status: "Pending", // Admin must approve
    });

    return { success: true, review: saved };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to submit review." };
  }
}

export async function updateReviewStatusAction(id: string, status: "Approved" | "Rejected"): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };

    await db.updateReviewStatus(id, status);
    await logAudit(admin, "update_status", "review", id, `status → ${status}`);
    revalidatePath("/admin/reviews");
    updateTag(CACHE_TAGS.reviews);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to update review status." };
  }
}

export async function deleteReviewAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };

    await db.deleteReview(id);
    await logAudit(admin, "delete", "review", id);
    revalidatePath("/admin/reviews");
    updateTag(CACHE_TAGS.reviews);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to delete review." };
  }
}

// ----------------------------------------------------
// Blog Actions
// ----------------------------------------------------
export async function saveBlogAction(blog: Omit<Blog, "id" | "created_at"> & { id?: string }): Promise<{ success: boolean; blog?: Blog; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };

    const slug = blog.slug || blog.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const saved = await db.saveBlog({ ...blog, slug });
    await logAudit(admin, blog.id ? "update" : "create", "blog", saved.id, saved.title);

    revalidatePath("/blog");
    revalidatePath(`/blog/${saved.slug}`);
    updateTag(CACHE_TAGS.blogs);
    return { success: true, blog: saved };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to save blog post." };
  }
}

export async function deleteBlogAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };

    await db.deleteBlog(id);
    await logAudit(admin, "delete", "blog", id);
    revalidatePath("/blog");
    updateTag(CACHE_TAGS.blogs);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to delete blog post." };
  }
}

// ----------------------------------------------------
// Testimonial Actions
// ----------------------------------------------------
export async function saveTestimonialAction(testimonial: Omit<Testimonial, "id" | "created_at"> & { id?: string }): Promise<{ success: boolean; testimonial?: Testimonial; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };

    const saved = await db.saveTestimonial(testimonial);
    await logAudit(admin, testimonial.id ? "update" : "create", "testimonial", saved.id, saved.customer_name);
    revalidatePath("/");
    revalidatePath("/admin/testimonials");
    updateTag(CACHE_TAGS.testimonials);
    return { success: true, testimonial: saved };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to save testimonial." };
  }
}

export async function deleteTestimonialAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };

    await db.deleteTestimonial(id);
    await logAudit(admin, "delete", "testimonial", id);
    revalidatePath("/");
    revalidatePath("/admin/testimonials");
    updateTag(CACHE_TAGS.testimonials);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to delete testimonial." };
  }
}

// ----------------------------------------------------
// Partner Actions
// ----------------------------------------------------
export async function savePartnerAction(partner: Omit<Partner, "id" | "created_at"> & { id?: string }): Promise<{ success: boolean; partner?: Partner; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };

    const saved = await db.savePartner(partner);
    await logAudit(admin, partner.id ? "update" : "create", "partner", saved.id, saved.name);
    revalidatePath("/");
    revalidatePath("/admin/partners");
    updateTag(CACHE_TAGS.partners);
    return { success: true, partner: saved };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to save partner." };
  }
}

export async function deletePartnerAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };

    await db.deletePartner(id);
    await logAudit(admin, "delete", "partner", id);
    revalidatePath("/");
    revalidatePath("/admin/partners");
    updateTag(CACHE_TAGS.partners);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to delete partner." };
  }
}

// ----------------------------------------------------
// FAQ Actions
// ----------------------------------------------------
export async function saveFaqAction(faq: Omit<Faq, "id" | "created_at"> & { id?: string }): Promise<{ success: boolean; faq?: Faq; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };

    const saved = await db.saveFaq(faq);
    await logAudit(admin, faq.id ? "update" : "create", "faq", saved.id, saved.question);
    revalidatePath("/");
    revalidatePath("/admin/faqs");
    updateTag(CACHE_TAGS.faqs);
    return { success: true, faq: saved };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to save FAQ." };
  }
}

export async function deleteFaqAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };

    await db.deleteFaq(id);
    await logAudit(admin, "delete", "faq", id);
    revalidatePath("/");
    revalidatePath("/admin/faqs");
    updateTag(CACHE_TAGS.faqs);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to delete FAQ." };
  }
}

// ----------------------------------------------------
// Gallery Actions
// ----------------------------------------------------
export async function saveGalleryImageAction(image: Omit<GalleryImage, "id" | "created_at"> & { id?: string }): Promise<{ success: boolean; image?: GalleryImage; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };

    const saved = await db.saveGalleryImage(image);
    await logAudit(admin, image.id ? "update" : "create", "gallery_image", saved.id, saved.caption);
    revalidatePath("/");
    revalidatePath("/admin/gallery");
    updateTag(CACHE_TAGS.gallery);
    return { success: true, image: saved };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to save gallery image." };
  }
}

export async function deleteGalleryImageAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };

    await db.deleteGalleryImage(id);
    await logAudit(admin, "delete", "gallery_image", id);
    revalidatePath("/");
    revalidatePath("/admin/gallery");
    updateTag(CACHE_TAGS.gallery);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to delete gallery image." };
  }
}

// ----------------------------------------------------
// Social Feed Actions (admin-curated — no live Instagram API integration)
// ----------------------------------------------------
export async function saveSocialPostAction(post: Omit<SocialPost, "id" | "created_at"> & { id?: string }): Promise<{ success: boolean; post?: SocialPost; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };

    const saved = await db.saveSocialPost(post);
    await logAudit(admin, post.id ? "update" : "create", "social_post", saved.id, saved.caption);
    revalidatePath("/");
    revalidatePath("/admin/social");
    updateTag(CACHE_TAGS.social);
    return { success: true, post: saved };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to save social post." };
  }
}

export async function deleteSocialPostAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };

    await db.deleteSocialPost(id);
    await logAudit(admin, "delete", "social_post", id);
    revalidatePath("/");
    revalidatePath("/admin/social");
    updateTag(CACHE_TAGS.social);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to delete social post." };
  }
}

// ----------------------------------------------------
// Favorite Tours Actions
// ----------------------------------------------------
export async function toggleFavoriteTourAction(tourId: string): Promise<{ success: boolean; favorited?: boolean; error?: string }> {
  try {
    const parsed = uuidLike.safeParse(tourId);
    if (!parsed.success) return { success: false, error: "Invalid tour." };
    tourId = parsed.data;

    const customer = await getCustomerSession();
    if (!customer) return { success: false, error: "Please log in to save favorite tours." };

    const current = customer.favorite_tour_ids || [];
    const isFavorited = current.includes(tourId);
    const updated = isFavorited
      ? current.filter((id) => id !== tourId)
      : [...current, tourId];

    await db.saveProfile({ ...customer, favorite_tour_ids: updated });
    revalidatePath("/portal");
    revalidatePath("/tours", "layout");
    return { success: true, favorited: !isFavorited };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to update favorites." };
  }
}

// ----------------------------------------------------
// Site Settings Actions (social links, etc.)
// ----------------------------------------------------
// Rendered directly as an <a href> in the Footer (see
// src/components/layout/Footer.tsx), so restrict to http(s) URLs — without
// this, a saved "javascript:" URL would execute on click for every visitor.
const httpUrl = z.string().trim().url().refine((v) => /^https?:\/\//i.test(v), "Must be an http(s) URL").or(z.literal(""));
const saveSiteSettingsSchema = z.object({
  facebook_url: httpUrl.optional(),
  instagram_url: httpUrl.optional(),
  twitter_url: httpUrl.optional(),
  tiktok_url: httpUrl.optional(),
  youtube_url: httpUrl.optional(),
  linkedin_url: httpUrl.optional(),
  whatsapp_number: z.string().trim().max(20).regex(/^[0-9+()\-\s]*$/, "Invalid phone number").optional(),
  office_address: z.string().trim().max(200).optional(),
  office_phone: z.string().trim().max(20).regex(/^[0-9+()\-\s]*$/, "Invalid phone number").or(z.literal("")).optional(),
  office_email: z.string().trim().email("Invalid email").or(z.literal("")).optional(),
});

export async function saveSiteSettingsAction(settings: {
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  tiktok_url?: string;
  youtube_url?: string;
  linkedin_url?: string;
  whatsapp_number?: string;
  office_address?: string;
  office_phone?: string;
  office_email?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized. Admin permissions required." };

    const parsed = saveSiteSettingsSchema.safeParse(settings);
    if (!parsed.success) {
      return { success: false, error: "Invalid settings — check that URLs are valid links." };
    }
    settings = parsed.data;

    await db.saveSiteSettings(settings);
    await logAudit(admin, "update", "site_settings", "site-settings", "Updated site settings");

    revalidatePath("/");
    revalidatePath("/admin/settings");
    updateTag(CACHE_TAGS.siteSettings);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to save settings." };
  }
}

export async function cancelBookingAction(bookingId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const parsedId = uuidLike.safeParse(bookingId);
    if (!parsedId.success) return { success: false, error: "Invalid booking." };
    bookingId = parsedId.data;

    const customer = await getCustomerSession();
    if (!customer) return { success: false, error: "Please log in first." };

    const booking = await db.getBookingById(bookingId);
    if (!booking) return { success: false, error: "Booking not found." };
    if (booking.customer_id !== customer.id) return { success: false, error: "Unauthorized." };

    if (booking.status === "Paid" || booking.status === "Completed") {
      return { success: false, error: "This booking is already paid or completed. Please contact support to request a refund." };
    }

    const updatedBooking: Booking = { ...booking, status: "Cancelled" };
    await db.saveBooking(updatedBooking);

    // Notify email
    const tour = await db.getTourById(booking.tour_id);
    if (tour) {
      sendBookingStatusUpdateEmail(updatedBooking, tour, customer.email, customer.name).catch(console.error);
    }

    revalidatePath("/portal");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to cancel booking." };
  }
}


// ----------------------------------------------------
// Meetings
// ----------------------------------------------------
// Public (guests can book a call), so it is rate-limited, validated and
// honeypot-protected. Only ever called after the customer presses "Confirm"
// on a meeting card — the AI assistant itself can never create one.
export async function requestMeetingAction(
  input: z.input<typeof meetingSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    const ip = await getActionClientIp();
    if (!(await rateLimitShared(`meeting:${ip}`, 5, 60 * 60 * 1000)).ok) {
      return { success: false, error: "Too many requests. Please try again later or message us on WhatsApp." };
    }

    const parsed = meetingSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message || "Please check your details." };
    const data = parsed.data;
    if (data.website) return { success: true }; // honeypot: silently drop bots

    const slotError = isValidMeetingSlot(data.preferred_date, data.preferred_time);
    if (slotError) return { success: false, error: slotError };

    if (!(await rateLimitShared(`meeting-email:${data.email}`, 3, 24 * 60 * 60 * 1000)).ok) {
      return { success: false, error: "You already have recent requests with us — we'll be in touch soon." };
    }

    await db.saveMeeting({
      name: data.name,
      email: data.email,
      phone: data.phone,
      topic: data.topic,
      channel: data.channel,
      preferred_date: data.preferred_date,
      preferred_time: data.preferred_time,
      notes: data.notes,
      tour_slug: data.tour_slug,
    });

    await captureLeadSafe({ email: data.email, name: data.name, phone: data.phone, source: "meeting", interest: data.topic, message: data.notes });

    // The request is safely stored; emails are best-effort.
    try {
      const settings = await db.getSiteSettings();
      await sendMeetingEmails(settings.office_email || process.env.CONTACT_NOTIFY_EMAIL, data);
    } catch (e) {
      console.error("Meeting notification email failed:", e);
    }

    revalidatePath("/admin/meetings");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error && e.message ? e.message : "Could not send your request." };
  }
}

// ----------------------------------------------------
// Quote requests ("not ready to book yet") — public lead capture
// ----------------------------------------------------
export async function requestQuoteAction(input: z.input<typeof quoteSchema>): Promise<{ success: boolean; error?: string }> {
  try {
    const ip = await getActionClientIp();
    if (!(await rateLimitShared(`quote:${ip}`, 5, 60 * 60 * 1000)).ok) {
      return { success: false, error: "Too many requests. Please try again later or message us on WhatsApp." };
    }
    const parsed = quoteSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message || "Please check your details." };
    const data = parsed.data;
    if (data.website) return { success: true }; // honeypot

    const tour = await db.getTourBySlug(data.tour_slug);
    if (!tour) return { success: false, error: "That tour could not be found." };

    const guests = `${data.adults} adult${data.adults > 1 ? "s" : ""}${data.children ? `, ${data.children} child${data.children > 1 ? "ren" : ""}` : ""}`;
    const message = [`Quote request for "${tour.title}"`, data.start_date ? `Start: ${data.start_date}` : null, `Guests: ${guests}`, data.message].filter(Boolean).join("\n");

    await db.saveInquiry({ name: data.name, email: data.email, phone: data.phone, subject: `Quote: ${tour.title}`.slice(0, 150), message });
    await captureLeadSafe({ email: data.email, name: data.name, phone: data.phone, source: "quote", interest: tour.title, message });

    try {
      const settings = await db.getSiteSettings();
      const to = settings.office_email || process.env.CONTACT_NOTIFY_EMAIL;
      if (to) await sendInquiryNotificationEmail(to, { name: data.name, email: data.email, phone: data.phone, subject: `Quote: ${tour.title}`, message });
    } catch (e) {
      console.error("Quote notification email failed:", e);
    }
    revalidatePath("/admin/leads");
    revalidatePath("/admin/inquiries");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error && e.message ? e.message : "Could not send your request." };
  }
}

// ----------------------------------------------------
// Leads — admin only
// ----------------------------------------------------
export async function updateLeadAction(id: string, updates: { status?: string; notes?: string }): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };
    const parsed = leadUpdateSchema.safeParse(updates);
    if (!uuidLike.safeParse(id).success || !parsed.success) return { success: false, error: "Invalid request." };
    await db.updateLead(id, parsed.data);
    await logAudit(admin, "update", "lead", id, parsed.data.status ? `status → ${parsed.data.status}` : "notes");
    revalidatePath("/admin/leads");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error && e.message ? e.message : "Failed to update lead." };
  }
}

export async function deleteLeadAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };
    if (!uuidLike.safeParse(id).success) return { success: false, error: "Invalid request." };
    await db.deleteLead(id);
    await logAudit(admin, "delete", "lead", id);
    revalidatePath("/admin/leads");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error && e.message ? e.message : "Failed to delete lead." };
  }
}

export async function updateMeetingStatusAction(id: string, status: "Requested" | "Confirmed" | "Completed" | "Cancelled"): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };
    if (!uuidLike.safeParse(id).success || !z.enum(["Requested", "Confirmed", "Completed", "Cancelled"]).safeParse(status).success) {
      return { success: false, error: "Invalid request." };
    }
    await db.updateMeetingStatus(id, status);
    await logAudit(admin, "update_status", "meeting", id, `status → ${status}`);
    revalidatePath("/admin/meetings");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error && e.message ? e.message : "Failed to update meeting." };
  }
}

export async function deleteMeetingAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };
    if (!uuidLike.safeParse(id).success) return { success: false, error: "Invalid request." };
    await db.deleteMeeting(id);
    await logAudit(admin, "delete", "meeting", id);
    revalidatePath("/admin/meetings");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error && e.message ? e.message : "Failed to delete meeting." };
  }
}

// ----------------------------------------------------
// Contact inquiries — admin only
// ----------------------------------------------------
export async function updateInquiryStatusAction(id: string, status: "New" | "Replied" | "Archived"): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };
    if (!uuidLike.safeParse(id).success || !z.enum(["New", "Replied", "Archived"]).safeParse(status).success) {
      return { success: false, error: "Invalid request." };
    }
    await db.updateInquiryStatus(id, status);
    await logAudit(admin, "update_status", "inquiry", id, `status → ${status}`);
    revalidatePath("/admin/inquiries");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error && e.message ? e.message : "Failed to update inquiry." };
  }
}

export async function deleteInquiryAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized." };
    if (!uuidLike.safeParse(id).success) return { success: false, error: "Invalid request." };
    await db.deleteInquiry(id);
    await logAudit(admin, "delete", "inquiry", id);
    revalidatePath("/admin/inquiries");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error && e.message ? e.message : "Failed to delete inquiry." };
  }
}


// ----------------------------------------------------
// Team (admin access) — admin only
// ----------------------------------------------------
export async function setAdminRoleAction(email: string, makeAdmin: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized. Admin permissions required." };

    const parsed = z.string().trim().toLowerCase().email().max(254).safeParse(email);
    if (!parsed.success) return { success: false, error: "Enter a valid email address." };

    const target = await db.getProfileByEmail(parsed.data);
    const adminCount = (await db.getProfiles()).filter((p) => p.role === "admin").length;
    const refusal = checkRoleChange({ actorId: admin.id, target, makeAdmin, adminCount });
    if (refusal || !target) return { success: false, error: refusal || "User not found." };

    await db.saveProfile({ ...target, role: makeAdmin ? "admin" : "customer" });
    await logAudit(admin, makeAdmin ? "grant_admin" : "revoke_admin", "profile", target.id, target.email);
    revalidatePath("/admin/team");
    revalidatePath("/admin/customers");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error && e.message ? e.message : "Could not change access." };
  }
}

// ----------------------------------------------------
// Customer account
// ----------------------------------------------------
export async function updateProfileAction(input: { name: string; phone?: string }): Promise<{ success: boolean; error?: string }> {
  try {
    const customer = await getCustomerSession();
    if (!customer) return { success: false, error: "Please log in." };
    const parsed = z
      .object({
        name: z.string().trim().min(2, "Please enter your name").max(120),
        phone: z.string().trim().max(24).regex(/^[0-9+()\-\s]*$/, "Invalid phone number").optional(),
      })
      .safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message || "Invalid details." };
    if (!(await rateLimitShared(`profile:${customer.id}`, 20, 60 * 60 * 1000)).ok) {
      return { success: false, error: "Too many changes. Please try again later." };
    }
    await db.saveProfile({ ...customer, name: parsed.data.name, phone: parsed.data.phone || undefined });
    revalidatePath("/portal");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error && e.message ? e.message : "Could not save your details." };
  }
}

export async function changePasswordAction(input: { current: string; next: string }): Promise<{ success: boolean; error?: string }> {
  try {
    const customer = await getCustomerSession();
    if (!customer) return { success: false, error: "Please log in." };
    const parsed = z
      .object({
        current: z.string().min(1).max(MAX_PASSWORD_LENGTH),
        next: z.string().min(8, "New password must be at least 8 characters").max(MAX_PASSWORD_LENGTH, "New password is too long"),
      })
      .safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message || "Invalid details." };

    // Guesses at the current password count against the same per-account limit as login.
    if (!(await rateLimitShared(`change-password:${customer.id}`, 5, 15 * 60 * 1000)).ok) {
      return { success: false, error: "Too many attempts. Please try again in a few minutes." };
    }
    if (!(await verifyPasswordConstantTime(parsed.data.current, customer.password_hash))) {
      return { success: false, error: "Your current password is incorrect." };
    }
    if (parsed.data.current === parsed.data.next) return { success: false, error: "Choose a password different from your current one." };

    await db.saveProfile({
      ...customer,
      password_hash: await hashPassword(parsed.data.next),
      // Signs out every other device; this session is re-issued just below.
      password_changed_at: new Date().toISOString(),
    });
    await setSessionCookie({ sub: customer.id, role: customer.role, email: customer.email });
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error && e.message ? e.message : "Could not change your password." };
  }
}
