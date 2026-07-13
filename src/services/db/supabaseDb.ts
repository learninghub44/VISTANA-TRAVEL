import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { DatabaseAdapter, Destination, Tour, Hotel, Vehicle, Guide, Booking, Review, Blog, Profile, Testimonial, Partner, Faq, NewsletterSubscriber, GalleryImage, AuditLog } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

class SupabaseDbAdapter implements DatabaseAdapter {
  private get client(): SupabaseClient {
    if (!supabase) {
      throw new Error("Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    }
    return supabase;
  }

  // Destinations
  async getDestinations(): Promise<Destination[]> {
    const { data, error } = await this.client.from("destinations").select("*").order("name");
    if (error) throw error;
    return data || [];
  }
  async getDestinationBySlug(slug: string): Promise<Destination | null> {
    const { data, error } = await this.client.from("destinations").select("*").eq("slug", slug).single();
    if (error) {
      if (error.code === "PGRST116") return null; // No rows found
      throw error;
    }
    return data;
  }
  async saveDestination(destination: Omit<Destination, "id" | "created_at"> & { id?: string }): Promise<Destination> {
    const { data, error } = await this.client
      .from("destinations")
      .upsert({
        ...destination,
        id: destination.id || undefined,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  async deleteDestination(id: string): Promise<boolean> {
    const { error } = await this.client.from("destinations").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  // Tours
  async getTours(): Promise<Tour[]> {
    const { data, error } = await this.client.from("tours").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }
  async getTourBySlug(slug: string): Promise<Tour | null> {
    const { data, error } = await this.client.from("tours").select("*").eq("slug", slug).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  }
  async getToursByDestination(destinationId: string): Promise<Tour[]> {
    const { data, error } = await this.client.from("tours").select("*").eq("destination_id", destinationId);
    if (error) throw error;
    return data || [];
  }
  async saveTour(tour: Omit<Tour, "id" | "created_at"> & { id?: string }): Promise<Tour> {
    const { data, error } = await this.client
      .from("tours")
      .upsert({
        ...tour,
        id: tour.id || undefined,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  async deleteTour(id: string): Promise<boolean> {
    const { error } = await this.client.from("tours").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  // Hotels
  async getHotels(): Promise<Hotel[]> {
    const { data, error } = await this.client.from("hotels").select("*").order("name");
    if (error) throw error;
    return data || [];
  }
  async saveHotel(hotel: Omit<Hotel, "id" | "created_at"> & { id?: string }): Promise<Hotel> {
    const { data, error } = await this.client
      .from("hotels")
      .upsert({
        ...hotel,
        id: hotel.id || undefined,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  async deleteHotel(id: string): Promise<boolean> {
    const { error } = await this.client.from("hotels").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    const { data, error } = await this.client.from("vehicles").select("*").order("type");
    if (error) throw error;
    return data || [];
  }
  async saveVehicle(vehicle: Omit<Vehicle, "id" | "created_at"> & { id?: string }): Promise<Vehicle> {
    const { data, error } = await this.client
      .from("vehicles")
      .upsert({
        ...vehicle,
        id: vehicle.id || undefined,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  async deleteVehicle(id: string): Promise<boolean> {
    const { error } = await this.client.from("vehicles").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  // Guides
  async getGuides(): Promise<Guide[]> {
    const { data, error } = await this.client.from("guides").select("*").order("name");
    if (error) throw error;
    return data || [];
  }
  async saveGuide(guide: Omit<Guide, "id" | "created_at"> & { id?: string }): Promise<Guide> {
    const { data, error } = await this.client
      .from("guides")
      .upsert({
        ...guide,
        id: guide.id || undefined,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  async deleteGuide(id: string): Promise<boolean> {
    const { error } = await this.client.from("guides").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  // Bookings
  async getBookings(): Promise<Booking[]> {
    const { data, error } = await this.client.from("bookings").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }
  async getBookingsByCustomer(customerId: string): Promise<Booking[]> {
    const { data, error } = await this.client
      .from("bookings")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }
  async getBookingById(id: string): Promise<Booking | null> {
    const { data, error } = await this.client.from("bookings").select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  }
  async saveBooking(booking: Omit<Booking, "id" | "created_at"> & { id?: string }): Promise<Booking> {
    const { data, error } = await this.client
      .from("bookings")
      .upsert({
        ...booking,
        id: booking.id || undefined,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  async deleteBooking(id: string): Promise<boolean> {
    const { error } = await this.client.from("bookings").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  // Reviews
  async getReviews(tourId?: string, approvedOnly?: boolean): Promise<Review[]> {
    let query = this.client.from("reviews").select("*").order("created_at", { ascending: false });
    if (tourId) {
      query = query.eq("tour_id", tourId);
    }
    if (approvedOnly) {
      query = query.eq("status", "Approved");
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
  async saveReview(review: Omit<Review, "id" | "created_at"> & { id?: string }): Promise<Review> {
    const { data, error } = await this.client
      .from("reviews")
      .upsert({
        ...review,
        id: review.id || undefined,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  async updateReviewStatus(id: string, status: "Approved" | "Rejected"): Promise<boolean> {
    const { error } = await this.client.from("reviews").update({ status }).eq("id", id);
    if (error) throw error;
    return true;
  }
  async deleteReview(id: string): Promise<boolean> {
    const { error } = await this.client.from("reviews").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  // Blogs
  async getBlogs(): Promise<Blog[]> {
    const { data, error } = await this.client.from("blogs").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }
  async getBlogBySlug(slug: string): Promise<Blog | null> {
    const { data, error } = await this.client.from("blogs").select("*").eq("slug", slug).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  }
  async saveBlog(blog: Omit<Blog, "id" | "created_at"> & { id?: string }): Promise<Blog> {
    const { data, error } = await this.client
      .from("blogs")
      .upsert({
        ...blog,
        id: blog.id || undefined,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  async deleteBlog(id: string): Promise<boolean> {
    const { error } = await this.client.from("blogs").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  // Profiles
  async getProfiles(): Promise<Profile[]> {
    const { data, error } = await this.client.from("profiles").select("*");
    if (error) throw error;
    return data || [];
  }
  async getProfileById(id: string): Promise<Profile | null> {
    const { data, error } = await this.client.from("profiles").select("*").eq("id", id).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  }
  async getProfileByEmail(email: string): Promise<Profile | null> {
    const { data, error } = await this.client.from("profiles").select("*").eq("email", email).single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  }
  async saveProfile(profile: Profile): Promise<Profile> {
    const { data, error } = await this.client.from("profiles").upsert(profile).select().single();
    if (error) throw error;
    return data;
  }

  // Testimonials
  async getTestimonials(featuredOnly?: boolean): Promise<Testimonial[]> {
    let q = this.client.from("testimonials").select("*").order("created_at", { ascending: false });
    if (featuredOnly) q = q.eq("featured", true);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }
  async saveTestimonial(t: Omit<Testimonial, "id" | "created_at"> & { id?: string }): Promise<Testimonial> {
    const { data, error } = await this.client.from("testimonials").upsert({ ...t, id: t.id || undefined }).select().single();
    if (error) throw error;
    return data;
  }
  async deleteTestimonial(id: string): Promise<boolean> {
    const { error } = await this.client.from("testimonials").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  // Partners
  async getPartners(): Promise<Partner[]> {
    const { data, error } = await this.client.from("partners").select("*").order("created_at");
    if (error) throw error;
    return data || [];
  }
  async savePartner(p: Omit<Partner, "id" | "created_at"> & { id?: string }): Promise<Partner> {
    const { data, error } = await this.client.from("partners").upsert({ ...p, id: p.id || undefined }).select().single();
    if (error) throw error;
    return data;
  }
  async deletePartner(id: string): Promise<boolean> {
    const { error } = await this.client.from("partners").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  // FAQs
  async getFaqs(): Promise<Faq[]> {
    const { data, error } = await this.client.from("faqs").select("*").order("order", { ascending: true });
    if (error) throw error;
    return data || [];
  }
  async saveFaq(f: Omit<Faq, "id" | "created_at"> & { id?: string }): Promise<Faq> {
    const { data, error } = await this.client.from("faqs").upsert({ ...f, id: f.id || undefined }).select().single();
    if (error) throw error;
    return data;
  }
  async deleteFaq(id: string): Promise<boolean> {
    const { error } = await this.client.from("faqs").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  // Newsletter
  async getSubscribers(): Promise<NewsletterSubscriber[]> {
    const { data, error } = await this.client.from("newsletter_subscribers").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }
  async addSubscriber(email: string): Promise<NewsletterSubscriber> {
    const { data: existing } = await this.client.from("newsletter_subscribers").select("*").eq("email", email).maybeSingle();
    if (existing) return existing;
    const { data, error } = await this.client.from("newsletter_subscribers").insert({ email }).select().single();
    if (error) throw error;
    return data;
  }

  // Gallery
  async getGalleryImages(): Promise<GalleryImage[]> {
    const { data, error } = await this.client.from("gallery_images").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }
  async saveGalleryImage(g: Omit<GalleryImage, "id" | "created_at"> & { id?: string }): Promise<GalleryImage> {
    const { data, error } = await this.client.from("gallery_images").insert(g).select().single();
    if (error) throw error;
    return data;
  }
  async deleteGalleryImage(id: string): Promise<boolean> {
    const { error } = await this.client.from("gallery_images").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  // Audit Logs
  async getAuditLogs(limit = 100): Promise<AuditLog[]> {
    const { data, error } = await this.client.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return data || [];
  }
  async addAuditLog(log: Omit<AuditLog, "id" | "created_at">): Promise<AuditLog> {
    const { data, error } = await this.client.from("audit_logs").insert(log).select().single();
    if (error) throw error;
    return data;
  }
}

export const supabaseDb = new SupabaseDbAdapter();
export { supabase };
