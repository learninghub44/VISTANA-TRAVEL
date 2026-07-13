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
  // Optional customer-uploaded documents (passport scans, visa letters, etc.)
  // required for some cross-border tours. Populated via
  // uploadBookingDocumentAction at booking time.
  // Supabase: `alter table bookings add column document_urls jsonb;`
  document_urls?: string[];
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
  updated_at: string;
}

export interface DatabaseAdapter {
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

  // Audit Logs
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
  addAuditLog(log: Omit<AuditLog, "id" | "created_at">): Promise<AuditLog>;

  // Site Settings (social links, etc.)
  getSiteSettings(): Promise<SiteSettings>;
  saveSiteSettings(settings: Partial<Omit<SiteSettings, "id" | "updated_at">>): Promise<SiteSettings>;
}
