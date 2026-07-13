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
  created_at: string;
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
}
