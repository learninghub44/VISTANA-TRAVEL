"use server";

import { db } from "@/services/db";
import { storage } from "@/services/storage";
import { sendBookingConfirmationEmail, sendBookingStatusUpdateEmail } from "@/services/email";
import { whatsapp } from "@/services/whatsapp";
import { Booking, Tour, Destination, Guide, Vehicle, Hotel, Blog, Review, Profile, Testimonial, Partner, Faq, GalleryImage } from "@/services/db/types";
import { getSession } from "@/services/auth/session";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/services/auth/rateLimit";

// Auth helper for server actions
async function getAdminSession(): Promise<Profile | null> {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;

  const profile = await db.getProfileById(session.sub);
  if (!profile || profile.role !== "admin") return null;
  return profile;
}

async function getCustomerSession(): Promise<Profile | null> {
  const session = await getSession();
  if (!session) return null;

  const profile = await db.getProfileById(session.sub);
  return profile || null;
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
export async function uploadImageAction(formData: FormData): Promise<{ url: string }> {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const url = await storage.uploadImage(buffer, file.name, file.type);
  return { url };
}

// Documents customers attach to a booking (passport scans, visa letters, etc.)
// for tours that require them. Separate from uploadImageAction so we can
// enforce customer-only auth, a stricter mime allowlist, and a size cap.
const ALLOWED_DOCUMENT_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024; // 8MB

export async function uploadBookingDocumentAction(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const customer = await getCustomerSession();
    if (!customer) return { success: false, error: "Please log in to upload documents." };

    const limited = rateLimit(`upload-doc:${customer.id}`, 20, 60 * 60 * 1000);
    if (!limited.ok) {
      return { success: false, error: "Too many uploads. Please try again later." };
    }

    const file = formData.get("file") as File | null;
    if (!file) return { success: false, error: "No file provided." };
    if (!ALLOWED_DOCUMENT_TYPES.has(file.type)) {
      return { success: false, error: "Unsupported file type. Please upload a PDF, JPG, PNG, or WEBP." };
    }
    if (file.size > MAX_DOCUMENT_BYTES) {
      return { success: false, error: "File is too large. Maximum size is 8MB." };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const url = await storage.uploadImage(buffer, file.name, file.type);
    return { success: true, url };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to upload document." };
  }
}

// ----------------------------------------------------
// Booking Actions
// ----------------------------------------------------
export async function createBookingAction(data: {
  tourId: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  specialRequests?: string;
  documentUrls?: string[];
}): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  try {
    const customer = await getCustomerSession();
    if (!customer) {
      return { success: false, error: "Please log in to make a booking." };
    }

    const tours = await db.getTours();
    const tour = tours.find((t) => t.id === data.tourId);
    if (!tour) {
      return { success: false, error: "Selected tour package not found." };
    }

    // Simple pricing: full price for adults, 50% for children
    const pricePerAdult = tour.price_usd;
    const pricePerChild = tour.price_usd * 0.5;
    const totalPrice = data.adults * pricePerAdult + data.children * pricePerChild;

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
      document_urls: data.documentUrls && data.documentUrls.length > 0 ? data.documentUrls : undefined,
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

    const booking = await db.getBookingById(bookingId);
    if (!booking) return { success: false, error: "Booking not found." };

    const tours = await db.getTours();
    const tour = tours.find((t) => t.id === booking.tour_id);
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

    const slug = tour.slug || tour.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const saved = await db.saveTour({ ...tour, slug });
    await logAudit(admin, tour.id ? "update" : "create", "tour", saved.id, saved.title);

    revalidatePath("/tours");
    revalidatePath(`/tours/${saved.slug}`);
    return { success: true, tour: saved };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to save tour package." };
  }
}

export async function deleteTourAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized. Admin permissions required." };

    await db.deleteTour(id);
    await logAudit(admin, "delete", "tour", id);
    revalidatePath("/tours");
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
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to delete hotel." };
  }
}

// ----------------------------------------------------
// Review Actions
// ----------------------------------------------------
export async function submitReviewAction(review: Omit<Review, "id" | "created_at" | "status">): Promise<{ success: boolean; review?: Review; error?: string }> {
  try {
    const customer = await getCustomerSession();
    const customerName = customer ? customer.name : review.customer_name || "Anonymous Traveler";

    const saved = await db.saveReview({
      ...review,
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
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to delete gallery image." };
  }
}

// ----------------------------------------------------
// Favorite Tours Actions
// ----------------------------------------------------
export async function toggleFavoriteTourAction(tourId: string): Promise<{ success: boolean; favorited?: boolean; error?: string }> {
  try {
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
export async function saveSiteSettingsAction(settings: {
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  tiktok_url?: string;
  youtube_url?: string;
  linkedin_url?: string;
  whatsapp_number?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await getAdminSession();
    if (!admin) return { success: false, error: "Unauthorized. Admin permissions required." };

    await db.saveSiteSettings(settings);
    await logAudit(admin, "update", "site_settings", "site-settings", "Updated social media links");

    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to save settings." };
  }
}

export async function cancelBookingAction(bookingId: string): Promise<{ success: boolean; error?: string }> {
  try {
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
    const tours = await db.getTours();
    const tour = tours.find((t) => t.id === booking.tour_id);
    if (tour) {
      sendBookingStatusUpdateEmail(updatedBooking, tour, customer.email, customer.name).catch(console.error);
    }

    revalidatePath("/portal");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to cancel booking." };
  }
}
