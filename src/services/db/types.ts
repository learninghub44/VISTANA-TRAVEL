export interface Destination {
  id: string;
  name: string;
  slug: string;
  overview: string;
  images: string[];
  attractions: string[];
  activities: string[];
  weather: string;
  latitude: number;
  longitude: number;
  travel_tips: { title: string; content: string }[];
  faqs: { question: string; answer: string }[];
  created_at: string;
}

export interface Tour {
  id: string;
  destination_id: string;
  title: string;
  slug: string;
  description: string;
  images: string[];
  duration_days: number;
  price_usd: number;
  category: string; // Safari, Beach, Adventure, etc.
  difficulty: "Easy" | "Moderate" | "Hard" | "Challenging";
  inclusions: string[];
  exclusions: string[];
  pickup_location: string;
  dropoff_location: string;
  max_guests: number;
  min_guests: number;
  languages: string[];
  guide_id?: string;
  faqs: { question: string; answer: string }[];
  itinerary: { day: number; title: string; description: string }[];
  created_at: string;
}

export interface Hotel {
  id: string;
  name: string;
  star_rating: number;
  images: string[];
  room_types: { name: string; price_usd: number; capacity: number }[];
  amenities: string[];
  contact_details: { phone: string; email: string; website?: string };
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface Vehicle {
  id: string;
  type: "Safari Land Cruiser" | "Tour Van" | "Bus" | "SUV";
  capacity: number;
  driver_name: string;
  license_plate: string;
  status: "Available" | "Maintenance" | "Assigned";
  created_at: string;
}

export interface Guide {
  id: string;
  name: string;
  languages: string[];
  experience_years: number;
  availability: boolean;
  rating: number;
  image_url: string;
  created_at: string;
}

export interface Booking {
  id: string;
  tour_id: string;
  customer_id: string;
  start_date: string;
  end_date: string;
  adults: number;
  children: number;
  special_requests?: string;
  status: "Pending" | "Confirmed" | "Awaiting Payment" | "Paid" | "Completed" | "Cancelled" | "Refunded";
  guide_id?: string;
  vehicle_id?: string;
  total_price: number;
  created_at: string;
}

export interface Review {
  id: string;
  tour_id: string;
  customer_name: string;
  rating: number;
  content: string;
  images?: string[];
  status: "Pending" | "Approved" | "Rejected";
  created_at: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  author: string;
  image_url: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  role: "admin" | "customer";
  name: string;
  phone?: string;
  avatar_url?: string;
  password_hash?: string;
  email_verified?: boolean;
  verification_token?: string | null;
  reset_token?: string | null;
  reset_token_expires?: string | null;
  favorite_tour_ids?: string[];
  // Set whenever the password changes; sessions issued before this are rejected.
  password_changed_at?: string | null;
  created_at: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "New" | "Replied" | "Archived";
  created_at: string;
}

export interface Meeting {
  id: string;
  name: string;
  email: string;
  phone?: string;
  topic: string;
  channel: "Video call" | "Phone call" | "WhatsApp call" | "Office visit";
  preferred_date: string; // YYYY-MM-DD (East Africa Time)
  preferred_time: string; // HH:MM (East Africa Time)
  notes?: string;
  tour_slug?: string;
  status: "Requested" | "Confirmed" | "Completed" | "Cancelled";
  created_at: string;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  customer_location?: string;
  avatar_url?: string;
  content: string;
  rating: number;
  featured: boolean;
  created_at: string;
}

export interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string;
  created_at: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  created_at: string;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  caption?: string;
  category?: string;
  destination_id?: string;
  created_at: string;
}

// Admin-curated social feed shown on the homepage in place of a live
// Instagram API integration (no live API token available — see AGENTS.md).
// Admins add posts manually; each links out to the real post on the
// platform it came from.
export interface SocialPost {
  id: string;
  image_url: string;
  caption?: string;
  platform: "instagram" | "facebook" | "tiktok" | "twitter";
  post_url?: string;
  display_order: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: string;
  created_at: string;
}

export interface SiteSettings {
  id: string;
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
  updated_at: string;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
}

export interface DatabaseAdapter {
  // Atomic, globally shared counter (see migration 20260715000002).
  hitRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;

  // Destinations
  getDestinations(): Promise<Destination[]>;
  getDestinationBySlug(slug: string): Promise<Destination | null>;
  saveDestination(destination: Omit<Destination, "id" | "created_at"> & { id?: string }): Promise<Destination>;
  deleteDestination(id: string): Promise<boolean>;

  // Tours
  getTours(): Promise<Tour[]>;
  getTourBySlug(slug: string): Promise<Tour | null>;
  getToursByDestination(destinationId: string): Promise<Tour[]>;
  saveTour(tour: Omit<Tour, "id" | "created_at"> & { id?: string }): Promise<Tour>;
  deleteTour(id: string): Promise<boolean>;

  // Hotels
  getHotels(): Promise<Hotel[]>;
  saveHotel(hotel: Omit<Hotel, "id" | "created_at"> & { id?: string }): Promise<Hotel>;
  deleteHotel(id: string): Promise<boolean>;

  // Vehicles
  getVehicles(): Promise<Vehicle[]>;
  saveVehicle(vehicle: Omit<Vehicle, "id" | "created_at"> & { id?: string }): Promise<Vehicle>;
  deleteVehicle(id: string): Promise<boolean>;

  // Guides
  getGuides(): Promise<Guide[]>;
  saveGuide(guide: Omit<Guide, "id" | "created_at"> & { id?: string }): Promise<Guide>;
  deleteGuide(id: string): Promise<boolean>;

  // Bookings
  getBookings(): Promise<Booking[]>;
  getBookingsByCustomer(customerId: string): Promise<Booking[]>;
  getBookingById(id: string): Promise<Booking | null>;
  saveBooking(booking: Omit<Booking, "id" | "created_at"> & { id?: string }): Promise<Booking>;
  deleteBooking(id: string): Promise<boolean>;

  // Reviews
  getReviews(tourId?: string, approvedOnly?: boolean): Promise<Review[]>;
  saveReview(review: Omit<Review, "id" | "created_at"> & { id?: string }): Promise<Review>;
  updateReviewStatus(id: string, status: "Approved" | "Rejected"): Promise<boolean>;
  deleteReview(id: string): Promise<boolean>;

  // Blogs
  getBlogs(): Promise<Blog[]>;
  getBlogBySlug(slug: string): Promise<Blog | null>;
  saveBlog(blog: Omit<Blog, "id" | "created_at"> & { id?: string }): Promise<Blog>;
  deleteBlog(id: string): Promise<boolean>;

  // Profiles / Users
  getProfiles(): Promise<Profile[]>;
  getProfileById(id: string): Promise<Profile | null>;
  getProfileByEmail(email: string): Promise<Profile | null>;
  saveProfile(profile: Profile): Promise<Profile>;
  // Tokens are stored hashed (sha256) — pass the hash, not the raw emailed token.
  getProfileByResetTokenHash(hash: string): Promise<Profile | null>;
  getProfileByVerificationTokenHash(hash: string): Promise<Profile | null>;
  getTourById(id: string): Promise<Tour | null>;

  // Meeting / consultation requests (made via the AI assistant or the site)
  getMeetings(): Promise<Meeting[]>;
  saveMeeting(meeting: Omit<Meeting, "id" | "created_at" | "status"> & { id?: string; status?: Meeting["status"] }): Promise<Meeting>;
  updateMeetingStatus(id: string, status: Meeting["status"]): Promise<void>;
  deleteMeeting(id: string): Promise<boolean>;

  // Contact inquiries
  getInquiries(): Promise<Inquiry[]>;
  saveInquiry(inquiry: Omit<Inquiry, "id" | "created_at" | "status"> & { id?: string; status?: Inquiry["status"] }): Promise<Inquiry>;
  updateInquiryStatus(id: string, status: Inquiry["status"]): Promise<void>;
  deleteInquiry(id: string): Promise<boolean>;

  // Testimonials
  getTestimonials(featuredOnly?: boolean): Promise<Testimonial[]>;
  saveTestimonial(t: Omit<Testimonial, "id" | "created_at"> & { id?: string }): Promise<Testimonial>;
  deleteTestimonial(id: string): Promise<boolean>;

  // Partners
  getPartners(): Promise<Partner[]>;
  savePartner(p: Omit<Partner, "id" | "created_at"> & { id?: string }): Promise<Partner>;
  deletePartner(id: string): Promise<boolean>;

  // FAQs
  getFaqs(): Promise<Faq[]>;
  saveFaq(f: Omit<Faq, "id" | "created_at"> & { id?: string }): Promise<Faq>;
  deleteFaq(id: string): Promise<boolean>;

  // Newsletter
  getSubscribers(): Promise<NewsletterSubscriber[]>;
  addSubscriber(email: string): Promise<NewsletterSubscriber>;

  // Gallery
  getGalleryImages(): Promise<GalleryImage[]>;
  saveGalleryImage(g: Omit<GalleryImage, "id" | "created_at"> & { id?: string }): Promise<GalleryImage>;
  deleteGalleryImage(id: string): Promise<boolean>;

  // Social Feed (admin-curated, replaces a live Instagram API integration)
  getSocialPosts(): Promise<SocialPost[]>;
  saveSocialPost(p: Omit<SocialPost, "id" | "created_at"> & { id?: string }): Promise<SocialPost>;
  deleteSocialPost(id: string): Promise<boolean>;

  // Audit Logs
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
  addAuditLog(log: Omit<AuditLog, "id" | "created_at">): Promise<AuditLog>;

  // Site Settings (social links, etc.)
  getSiteSettings(): Promise<SiteSettings>;
  saveSiteSettings(settings: Partial<Omit<SiteSettings, "id" | "updated_at">>): Promise<SiteSettings>;
}
