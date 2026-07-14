import fs from "fs";
import path from "path";
import { DatabaseAdapter, Destination, Tour, Hotel, Vehicle, Guide, Booking, Review, Blog, Profile, Testimonial, Partner, Faq, NewsletterSubscriber, GalleryImage, SocialPost, AuditLog, SiteSettings } from "./types";

const DB_DIR = path.join(process.cwd(), "src/data");
const DB_FILE = path.join(DB_DIR, "local_db.json");

interface LocalDbSchema {
  destinations: Destination[];
  tours: Tour[];
  hotels: Hotel[];
  vehicles: Vehicle[];
  guides: Guide[];
  bookings: Booking[];
  reviews: Review[];
  blogs: Blog[];
  profiles: Profile[];
  testimonials: Testimonial[];
  partners: Partner[];
  faqs: Faq[];
  subscribers: NewsletterSubscriber[];
  gallery: GalleryImage[];
  social_posts: SocialPost[];
  audit_logs: AuditLog[];
  settings: SiteSettings;
}

// Helper to generate UUIDs locally
function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + "-" + Math.random().toString(36).substring(2, 9);
}

// Initial seed data
const initialData: LocalDbSchema = {
  destinations: [
    {
      id: "dest-mara",
      name: "Maasai Mara National Reserve",
      slug: "maasai-mara",
      overview: "World-renowned for its exceptional population of lions, leopards, cheetahs and the annual migration of wildebeest, zebra, and gazelle, the Maasai Mara is a majestic theatre of wildlife. Stretching over 1,510 square kilometers of open grasslands, it is bordered by the Serengeti to the south.",
      images: [
        "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=800&q=80"
      ],
      attractions: ["Mara River Crossings", "Musiara Swamp", "Maasai Cultural Villages", "Oloololo Escarpment"],
      activities: ["Hot Air Balloon Safaris", "Game Drives", "Cultural Walking Safaris", "Bush Dinners"],
      weather: "Warm and dry during the day (25-30°C), cool at night (12-15°C). Rainy seasons are April-May and November.",
      latitude: -1.4061,
      longitude: 35.0868,
      travel_tips: [
        { title: "Best Time to Visit", content: "July to October is ideal for witnessing the Great Migration." },
        { title: "Clothing", content: "Pack neutral colors (khakis, browns) and a warm jacket for morning game drives." },
        { title: "Health", content: "Yellow fever certification is recommended, and consult a doctor for malaria prophylactics." }
      ],
      faqs: [
        { question: "When is the wildebeest migration in the Maasai Mara?", answer: "The dramatic Mara River crossings typically happen between July and October, though resident wildlife can be seen year-round." },
        { question: "How far is the Maasai Mara from Nairobi?", answer: "It's about a 5-6 hour drive, or a 45-minute scheduled flight from Nairobi's Wilson Airport." }
      ],
      created_at: new Date().toISOString()
    },
    {
      id: "dest-serengeti",
      name: "Serengeti National Park",
      slug: "serengeti",
      overview: "The Serengeti is Tanzania's oldest and most popular national park, famed for its annual migration where some six million hooves pound the open plains. It offers arguably the most scintillating game-viewing in Africa, with great herds of buffalo, smaller groups of elephant and giraffe, and thousands of eland, topi, kongoni, impala and Grant’s gazelle.",
      images: [
        "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1504829857797-ddff28127792?auto=format&fit=crop&w=800&q=80"
      ],
      attractions: ["Seronera Valley", "Grumeti River", "Lobo Valley", "Kopjes (rock outcrops)"],
      activities: ["Day Game Drives", "Hot Air Balloon Flight", "Night Safaris (outside park boundaries)"],
      weather: "Moderate climate. Day temperatures average 27°C while nights get cooler around 13°C.",
      latitude: -2.1540,
      longitude: 34.6857,
      travel_tips: [
        { title: "Wildlife Tips", content: "Always follow your guide's safety guidelines and never step out of the safari cruiser except in designated areas." },
        { title: "Park Entry", content: "Keep your electronic payment cards ready, as cash is not accepted at the park entry gates." }
      ],
      faqs: [
        { question: "Is the Serengeti combined with the Maasai Mara on one trip?", answer: "Yes, many of our itineraries link both parks via the Isebania border crossing, letting you follow the migration across both countries." }
      ],
      created_at: new Date().toISOString()
    },
    {
      id: "dest-zanzibar",
      name: "Zanzibar Archipelago",
      slug: "zanzibar",
      overview: "An jewel in the Indian Ocean, Zanzibar boasts white sand beaches, crystalline turquoise waters, and the UNESCO World Heritage site Stone Town. Fused with African, Arab, European, and Indian influences, Zanzibar offers an incredible cultural and sensory experience alongside tropical relaxation.",
      images: [
        "https://images.unsplash.com/photo-1540206395-68808572332f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=800&q=80"
      ],
      attractions: ["Stone Town", "Prison Island", "Jozani Chwaka Bay Forest", "Spice Plantations"],
      activities: ["Scuba Diving & Snorkeling", "Spice Farm Tours", "Dhow Sunset Cruises", "Kitesurfing at Paje Beach"],
      weather: "Tropical, humid, and warm year-round. Temperatures average 28°C with pleasant ocean breezes.",
      latitude: -6.1659,
      longitude: 39.1983,
      travel_tips: [
        { title: "Cultural Respect", content: "Stone Town is predominantly conservative. Please dress modestly, covering shoulders and knees when exploring the town." },
        { title: "Currency", content: "Tanzanian Shillings and US Dollars are widely accepted. Carry cash as card services can be rare in local villages." }
      ],
      faqs: [
        { question: "Is Zanzibar good for a beach-only holiday?", answer: "Yes — Zanzibar works well both as a standalone beach getaway or as a relaxing add-on after a mainland safari." }
      ],
      created_at: new Date().toISOString()
    },
    {
      id: "dest-diani",
      name: "Diani Beach",
      slug: "diani-beach",
      overview: "Located 30 kilometers south of Mombasa, Diani Beach is a majestic 17-kilometer stretch of white sands, bordered by warm azure waters and palm trees. Regularly voted as one of Africa's best beach destinations, Diani offers a spectacular barrier reef, diverse water sports, and fine dining.",
      images: [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&w=800&q=80"
      ],
      attractions: ["Kisite-Mpunguti Marine Park", "Shimba Hills National Reserve", "Kongo Mosque", "Colobus Conservation Trust"],
      activities: ["Snorkeling with Dolphins", "Skydiving", "Deep Sea Fishing", "Golfing"],
      weather: "Warm, sunny beach weather. Average temperature ranges from 24°C at night to 32°C during the day.",
      latitude: -4.2798,
      longitude: 39.5947,
      travel_tips: [
        { title: "Getting There", content: "You can fly directly to Ukunda (Diani) Airstrip from Nairobi, or take a flight to Mombasa and drive (approx. 2 hours via ferry/bypass)." }
      ],
      faqs: [
        { question: "What's the best way to get to Diani Beach?", answer: "A direct flight to Ukunda Airstrip is fastest; alternatively fly into Mombasa and continue by road and ferry." }
      ],
      created_at: new Date().toISOString()
    }
  ],
  tours: [
    {
      id: "tour-mara-mig",
      destination_id: "dest-mara",
      title: "7-Day Premium Maasai Mara & Serengeti Migration Safari",
      slug: "maasai-mara-serengeti-migration-safari",
      description: "Witness the greatest wildlife show on Earth on this luxurious journey through Kenya's Maasai Mara and Tanzania's Serengeti. Designed for travelers seeking ultimate comfort while experiencing untamed African wilderness, this safari offers double daily game drives, five-star luxury camp accommodations, gourmet dining, and private guiding.",
      images: [
        "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1504829857797-ddff28127792?auto=format&fit=crop&w=800&q=80"
      ],
      duration_days: 7,
      price_usd: 3450,
      category: "Luxury Safari",
      difficulty: "Easy",
      inclusions: [
        "Luxury tented lodge accommodation (Full Board)",
        "Private 4x4 Safari Land Cruiser with open-roof",
        "Professional English & Swahili-speaking driver-guide",
        "All park entrance fees and concession fees",
        "Flying Doctors emergency evacuation cover",
        "Complimentary water and local beers in the vehicle"
      ],
      exclusions: [
        "International flight tickets",
        "Visas (Kenya and Tanzania)",
        "Tipping for guides and lodge staff",
        "Hot air balloon safari ($450 optional addon)"
      ],
      pickup_location: "Nairobi (Jomo Kenyatta International Airport)",
      dropoff_location: "Arusha or Kilimanjaro Airport",
      max_guests: 6,
      min_guests: 2,
      languages: ["English", "Swahili", "German"],
      guide_id: "guide-lek",
      faqs: [
        { question: "What is the best month for this migration safari?", answer: "The wildebeest herds cross the Mara River typically between July and October. However, the Serengeti portion offers incredible resident game-viewing year-round." },
        { question: "Do we cross the border between Kenya and Tanzania directly?", answer: "Yes, we transition via the Isebania border, where you will clear customs and change vehicles to comply with Tanzanian/Kenyan licensing laws." }
      ],
      itinerary: [
        { day: 1, title: "Nairobi to Maasai Mara Reserve", description: "Arrive at JKIA Nairobi where you will be met by your private guide. Board your 4x4 cruiser and head into the Great Rift Valley, arriving at Maasai Mara in time for an afternoon game drive and dinner at Mara Serena Lodge." },
        { day: 2, title: "Maasai Mara National Reserve - Full Day Game Drives", description: "Experience two comprehensive game drives today. Spot the Big Five (lion, leopard, elephant, buffalo, rhino) and, if visiting between July and October, look out for the dramatic wildebeest river crossings." },
        { day: 3, title: "Maasai Mara to Serengeti via Isebania Border", description: "Depart early after breakfast and drive south to the Kenya-Tanzania border at Isebania. Clear customs, swap vehicles, and continue into the central Serengeti plains, tracking game along the way." },
        { day: 4, title: "Central Serengeti Plains Exploration", description: "Enjoy morning and evening game drives in the central Seronera region. Search for cheetahs in the grasslands, leopards sleeping in acacia trees, and pride of lions resting on giant granite kopjes." },
        { day: 5, title: "Northern Serengeti & Migration Crossing", description: "Drive north to the Mara River region of the Serengeti. Spend the day watching the banks of the river, waiting for the massive herds of wildebeest to brave the crocodiles and cross the water." },
        { day: 6, title: "Ngorongoro Crater Conservation Area", description: "Drive to the rim of the world-famous Ngorongoro Crater. Descend 600 meters into the caldera for a spectacular half-day game drive in this 'Garden of Eden' before overnighting at a crater rim lodge." },
        { day: 7, title: "Ngorongoro to Arusha & Departure", description: "Have a relaxed breakfast, climb out of the highlands, and transfer to Arusha for lunch and your onward flight at Kilimanjaro International Airport." }
      ],
      created_at: new Date().toISOString()
    },
    {
      id: "tour-zanzibar-beach",
      destination_id: "dest-zanzibar",
      title: "5-Day Zanzibar Island & Spice Paradise Getaway",
      slug: "zanzibar-island-spice-paradise-getaway",
      description: "Indulge in a perfect blend of rich culture and tropical relaxation. Explore the labyrinthine stone alleys of Stone Town, inhale the fragrances of clove and nutmeg at a spice farm, and lounge on the pristine powdery white sand of Zanzibar's northern beaches. Unpack at a boutique beachfront resort and let the Indian Ocean sweep your cares away.",
      images: [
        "https://images.unsplash.com/photo-1540206395-68808572332f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=800&q=80"
      ],
      duration_days: 5,
      price_usd: 1250,
      category: "Beach Holiday",
      difficulty: "Easy",
      inclusions: [
        "Boutique hotel / resort accommodation",
        "Daily breakfast & dinner (Half Board)",
        "All transfers in private air-conditioned vehicle",
        "Stone Town guided walking tour",
        "Spice plantation tour & lunch",
        "Prison Island boat ride and entry fee"
      ],
      exclusions: [
        "Lunch on beach resort days",
        "Water sports equipment hire",
        "Infrastructure tax ($5 per person per night paid directly)"
      ],
      pickup_location: "Zanzibar International Airport (ZNZ) or Ferry Terminal",
      dropoff_location: "Zanzibar International Airport (ZNZ)",
      max_guests: 10,
      min_guests: 1,
      languages: ["English", "Swahili", "French", "Italian"],
      guide_id: "guide-temu",
      faqs: [
        { question: "Can we extend this beach holiday?", answer: "Absolutely! We can add extra nights at our partner resorts or arrange extensions to Paje or Nungwi beaches." }
      ],
      itinerary: [
        { day: 1, title: "Stone Town Historical Tour", description: "Arrive in Zanzibar and transfer to your historic hotel in Stone Town. Set off on a walking tour of the Darajani Market, the House of Wonders, and the Old Slave Market site." },
        { day: 2, title: "Spice Plantations & Giant Tortoises", description: "Explore a traditional spice farm, smelling cloves, vanilla, and nutmeg. In the afternoon, ride a wooden dhow to Prison Island to feed the giant Aldabra tortoises." },
        { day: 3, title: "Transfer to Beach Resort & Sunset Dhow Cruise", description: "Drive to Nungwi beach in the north. Check into your premium resort. In the late afternoon, step onto a wooden sailing dhow for a relaxing sunset cruise with drinks." },
        { day: 4, title: "Tropical Beach & Water Sports Day", description: "Spend the day lounging under palm trees, snorkeling in the clear lagoon, or diving at the famous Mnemba Atoll reef." },
        { day: 5, title: "Farewell Zanzibar", description: "Enjoy a final swim and morning breakfast before checking out and transferring back to the airport for your departure flight." }
      ],
      created_at: new Date().toISOString()
    },
    {
      id: "tour-diani-lux",
      destination_id: "dest-diani",
      title: "4-Day Premium Diani Beach Luxury Escape",
      slug: "diani-beach-luxury-escape",
      description: "Experience coastal paradise at its finest. Voted multiple times as Africa's leading beach destination, Diani Beach offers soft sand, palm-fringed shorelines, and vibrant coral reefs. Stay in a five-star luxury beachfront villa, enjoy private dining on the beach, and embark on a snorkeling safari to Kisite-Mpunguti Marine Park.",
      images: [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&w=800&q=80"
      ],
      duration_days: 4,
      price_usd: 1450,
      category: "Honeymoon",
      difficulty: "Easy",
      inclusions: [
        "5-Star luxury beach villa accommodation",
        "Full board meals, including a private beach dinner",
        "VIP airport transfers from Ukunda Airstrip",
        "Private Dhow safari to Kisite Marine Park with seafood lunch",
        "Couple spa therapy (90 minutes)"
      ],
      exclusions: [
        "Flights to/from Diani/Mombasa",
        "Motorized water sports",
        "Premium alcoholic beverages"
      ],
      pickup_location: "Ukunda Airstrip or Mombasa Airport",
      dropoff_location: "Ukunda Airstrip or Mombasa Airport",
      max_guests: 4,
      min_guests: 2,
      languages: ["English", "Swahili"],
      faqs: [
        { question: "Is this suitable for a honeymoon?", answer: "This is our signature honeymoon package. We include special surprises, flowers, and custom dining set ups for couples." }
      ],
      itinerary: [
        { day: 1, title: "VIP Coastal Arrival", description: "Arrive via Ukunda airstrip and check into your beachfront sanctuary. Indulge in sunset cocktails and a candlelight dinner on the sand." },
        { day: 2, title: "Kisite-Mpunguti Marine Dhow Safari", description: "Board a traditional Arabian dhow and sail to the marine park. Snorkel with turtles and dolphins, followed by an island seafood lunch." },
        { day: 3, title: "Couples Spa & Shimba Hills Walk", description: "Have a lazy morning, then visit Shimba Hills forest for a walk. In the afternoon, enjoy a 90-minute couples massage under palm trees." },
        { day: 4, title: "Beach Departure", description: "Enjoy a gourmet breakfast, dip your toes in the Indian Ocean one last time, and take your private VIP transfer to the airport." }
      ],
      created_at: new Date().toISOString()
    }
  ],
  hotels: [
    {
      id: "hotel-mara-serena",
      name: "Mara Serena Safari Lodge",
      star_rating: 5,
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
      ],
      room_types: [
        { name: "Luxury Double Room", price_usd: 450, capacity: 2 },
        { name: "Executive Suite", price_usd: 750, capacity: 3 }
      ],
      amenities: ["Swimming Pool", "Spa & Gym", "Safari Bar", "Helipad", "High-speed Wi-Fi"],
      contact_details: {
        phone: "+254 712 345678",
        email: "mara@serenahotels.com",
        website: "https://www.serenahotels.com/mara"
      },
      latitude: -1.4123,
      longitude: 35.0345,
      created_at: new Date().toISOString()
    },
    {
      id: "hotel-residence-znz",
      name: "The Residence Zanzibar",
      star_rating: 5,
      images: [
        "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80"
      ],
      room_types: [
        { name: "Garden Pool Villa", price_usd: 550, capacity: 2 },
        { name: "Ocean Front Pool Villa", price_usd: 800, capacity: 2 }
      ],
      amenities: ["Private Pools", "Tennis Court", "Spa Center", "Water Sports", "Kids Club"],
      contact_details: {
        phone: "+255 24 220 1000",
        email: "reservation-zanzibar@theresidence.com",
        website: "https://www.cenizaro.com/theresidence/zanzibar"
      },
      latitude: -6.4256,
      longitude: 39.4678,
      created_at: new Date().toISOString()
    }
  ],
  vehicles: [
    {
      id: "veh-cruiser-01",
      type: "Safari Land Cruiser",
      capacity: 7,
      driver_name: "Emmanuel Temu",
      license_plate: "T 456 DFC",
      status: "Available",
      created_at: new Date().toISOString()
    },
    {
      id: "veh-van-01",
      type: "Tour Van",
      capacity: 8,
      driver_name: "John Kamau",
      license_plate: "KCA 998B",
      status: "Available",
      created_at: new Date().toISOString()
    }
  ],
  guides: [
    {
      id: "guide-lek",
      name: "David Lekishon",
      languages: ["English", "Swahili", "Maa"],
      experience_years: 12,
      availability: true,
      rating: 4.9,
      image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      created_at: new Date().toISOString()
    },
    {
      id: "guide-temu",
      name: "Emmanuel Temu",
      languages: ["English", "Swahili", "German"],
      experience_years: 15,
      availability: true,
      rating: 4.8,
      image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      created_at: new Date().toISOString()
    }
  ],
  bookings: [
    {
      id: "bk-8921",
      tour_id: "tour-mara-mig",
      customer_id: "cust-john",
      start_date: "2026-08-10",
      end_date: "2026-08-17",
      adults: 2,
      children: 1,
      special_requests: "Require a vegetarian menu during safari and a baby booster seat in the vehicle.",
      status: "Confirmed",
      guide_id: "guide-lek",
      vehicle_id: "veh-van-01",
      total_price: 10350, // (3450 * 3)
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
    },
    {
      id: "bk-1102",
      tour_id: "tour-zanzibar-beach",
      customer_id: "cust-sarah",
      start_date: "2026-09-05",
      end_date: "2026-09-10",
      adults: 2,
      children: 0,
      special_requests: "Celebrating our 5th wedding anniversary. Kindly request a double bed room with rose petals.",
      status: "Pending",
      total_price: 2500,
      created_at: new Date().toISOString()
    }
  ],
  reviews: [
    {
      id: "rev-01",
      tour_id: "tour-mara-mig",
      customer_name: "Sarah Jenkins",
      rating: 5,
      content: "The migration crossing at Mara River was stunning! David was an incredible guide—he knew exactly where to position the vehicle for the best photographs. The lodges exceeded all five-star expectations. Worth every dollar!",
      images: ["https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=400&q=80"],
      status: "Approved",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "rev-02",
      tour_id: "tour-zanzibar-beach",
      customer_name: "Liam O'Connor",
      rating: 5,
      content: "Excellent blend of history in Stone Town and pure beach bliss at the beach resort. Spice tour was very interactive. Highly recommended!",
      status: "Approved",
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  blogs: [
    {
      id: "blog-01",
      title: "The Ultimate Guide to the Great Wildebeest Migration in East Africa",
      slug: "ultimate-guide-great-wildebeest-migration",
      content: "Every year, over 1.5 million wildebeests, accompanied by hundreds of thousands of zebras and gazelles, embark on a perilous circular journey through the Serengeti-Mara ecosystem. This guide details when and where to see the river crossings, how to plan your game drives, what to pack, and how to secure the best photography vantage points.",
      category: "Safari",
      author: "Vistana Safari Experts",
      image_url: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80",
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "blog-02",
      title: "Top 5 Pristine Beaches in Diani & Zanzibar You Must Explore",
      slug: "top-pristine-beaches-diani-zanzibar",
      content: "East Africa is renowned for its wildlife, but its coastline is equally legendary. From the dynamic kite-surfing center Paje in Zanzibar to the quiet, exclusive luxury sands of Galu Beach in Diani, we rate the top 5 beaches on cleanliness, accessibility, water sports, and lodging options. Find your slice of paradise.",
      category: "Beach Holiday",
      author: "Grace Wambua",
      image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  profiles: [
    {
      id: "cust-john",
      email: "john@example.com",
      role: "customer",
      name: "John Doe",
      phone: "+1 202 555 0122",
      created_at: new Date().toISOString()
    },
    {
      id: "cust-sarah",
      email: "sarah@example.com",
      role: "customer",
      name: "Sarah Jenkins",
      phone: "+44 20 7946 0192",
      created_at: new Date().toISOString()
    },
    {
      id: "admin-user",
      email: "admin@vistana.com",
      role: "admin",
      name: "Super Admin",
      phone: "+254 700 000 000",
      created_at: new Date().toISOString()
    }
  ],
  testimonials: [],
  partners: [],
  faqs: [
    { id: "faq-001", question: "How do I book a safari or tour?", answer: "Browse tours on the site, select your dates and group size, and submit a booking request. Our team will confirm availability and follow up with payment details via email or WhatsApp.", order: 1, created_at: new Date().toISOString() },
    { id: "faq-002", question: "What payment methods do you accept?", answer: "We accept M-Pesa, major credit/debit cards, and bank transfer. A deposit secures your booking, with the balance due before departure.", order: 2, created_at: new Date().toISOString() },
    { id: "faq-003", question: "Do I need a visa to travel to Kenya or Tanzania?", answer: "Most visitors need a visa or eTA for Kenya and Tanzania. Requirements vary by nationality, so check with the relevant embassy or apply online in advance of your trip.", order: 3, created_at: new Date().toISOString() },
    { id: "faq-004", question: "What is your cancellation and refund policy?", answer: "Refund terms depend on how far in advance you cancel. See our Refund Policy page for full details, or contact us directly for your specific booking.", order: 4, created_at: new Date().toISOString() },
    { id: "faq-005", question: "What should I pack for a safari?", answer: "Neutral-colored lightweight clothing, a warm layer for early mornings and evenings, sturdy closed shoes, sun protection, and any personal medication. We will send a detailed packing list once your trip is confirmed.", order: 5, created_at: new Date().toISOString() },
    { id: "faq-006", question: "Is travel insurance required?", answer: "We strongly recommend comprehensive travel insurance covering medical evacuation, trip cancellation, and lost luggage for all safari and travel bookings.", order: 6, created_at: new Date().toISOString() }
  ],
  subscribers: [],
  gallery: [
    {
      id: "gallery-01",
      image_url: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
      caption: "The Great Wildebeest Migration crossing the Maasai Mara",
      category: "Safari",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "gallery-02",
      image_url: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80",
      caption: "Golden hour over the Mara savanna",
      category: "Safari",
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "gallery-03",
      image_url: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1200&q=80",
      caption: "Game drive at sunset, Maasai Mara National Reserve",
      category: "Wildlife",
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "gallery-04",
      image_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
      caption: "The endless plains of the Serengeti",
      category: "Nature",
      created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "gallery-05",
      image_url: "https://images.unsplash.com/photo-1504829857797-ddff28127792?auto=format&fit=crop&w=1200&q=80",
      caption: "Wildlife up close in the Serengeti ecosystem",
      category: "Wildlife",
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "gallery-06",
      image_url: "https://images.unsplash.com/photo-1540206395-68808572332f?auto=format&fit=crop&w=1200&q=80",
      caption: "Turquoise waters off the Zanzibar Archipelago",
      category: "Beach",
      created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "gallery-07",
      image_url: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=1200&q=80",
      caption: "Sunset dhow cruise, Zanzibar",
      category: "Beach",
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "gallery-08",
      image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      caption: "Pristine white sands of Diani Beach",
      category: "Beach",
      created_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "gallery-09",
      image_url: "https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&w=1200&q=80",
      caption: "Palm groves along the Diani coastline",
      category: "Nature",
      created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  social_posts: [],
  audit_logs: [],
  settings: {
    id: "site-settings",
    office_address: "Vistana Plaza, 4th Floor, Ngong Road, Nairobi, Kenya",
    office_phone: "+254 701 059 192",
    office_email: "info@vistanatours.com",
    updated_at: new Date().toISOString(),
  }
};

class LocalDbAdapter implements DatabaseAdapter {
  private readDb(): LocalDbSchema {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      this.writeDb(initialData);
      return initialData;
    }
    try {
      const dataStr = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(dataStr);
      // Backfill any collections added in later versions of the schema
      return {
        ...initialData,
        ...parsed,
        testimonials: parsed.testimonials || [],
        partners: parsed.partners || [],
        faqs: parsed.faqs || [],
        subscribers: parsed.subscribers || [],
        gallery: parsed.gallery || [],
        social_posts: parsed.social_posts || [],
        audit_logs: parsed.audit_logs || [],
        settings: parsed.settings || initialData.settings,
      };
    } catch (e) {
      console.error("Failed to read local DB file, returning seed data", e);
      return initialData;
    }
  }

  private writeDb(data: LocalDbSchema): void {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  }

  // Destinations
  async getDestinations(): Promise<Destination[]> {
    return this.readDb().destinations;
  }
  async getDestinationBySlug(slug: string): Promise<Destination | null> {
    const item = this.readDb().destinations.find((d) => d.slug === slug);
    return item || null;
  }
  async saveDestination(destination: Omit<Destination, "id" | "created_at"> & { id?: string }): Promise<Destination> {
    const db = this.readDb();
    let record: Destination;
    if (destination.id) {
      const index = db.destinations.findIndex((d) => d.id === destination.id);
      if (index > -1) {
        record = {
          ...db.destinations[index],
          ...destination,
          images: destination.images || [],
          attractions: destination.attractions || [],
          activities: destination.activities || [],
          travel_tips: destination.travel_tips || [],
          faqs: destination.faqs || []
        } as Destination;
        db.destinations[index] = record;
      } else {
        record = {
          ...destination,
          id: destination.id,
          created_at: new Date().toISOString()
        } as Destination;
        db.destinations.push(record);
      }
    } else {
      record = {
        ...destination,
        id: "dest-" + generateId(),
        created_at: new Date().toISOString()
      } as Destination;
      db.destinations.push(record);
    }
    this.writeDb(db);
    return record;
  }
  async deleteDestination(id: string): Promise<boolean> {
    const db = this.readDb();
    const len = db.destinations.length;
    db.destinations = db.destinations.filter((d) => d.id !== id);
    this.writeDb(db);
    return db.destinations.length < len;
  }

  // Tours
  async getTours(): Promise<Tour[]> {
    return this.readDb().tours;
  }
  async getTourBySlug(slug: string): Promise<Tour | null> {
    return this.readDb().tours.find((t) => t.slug === slug) || null;
  }
  async getToursByDestination(destinationId: string): Promise<Tour[]> {
    return this.readDb().tours.filter((t) => t.destination_id === destinationId);
  }
  async saveTour(tour: Omit<Tour, "id" | "created_at"> & { id?: string }): Promise<Tour> {
    const db = this.readDb();
    let record: Tour;
    if (tour.id) {
      const index = db.tours.findIndex((t) => t.id === tour.id);
      if (index > -1) {
        record = {
          ...db.tours[index],
          ...tour,
          images: tour.images || [],
          inclusions: tour.inclusions || [],
          exclusions: tour.exclusions || [],
          languages: tour.languages || [],
          faqs: tour.faqs || []
        } as Tour;
        db.tours[index] = record;
      } else {
        record = {
          ...tour,
          id: tour.id,
          created_at: new Date().toISOString()
        } as Tour;
        db.tours.push(record);
      }
    } else {
      record = {
        ...tour,
        id: "tour-" + generateId(),
        created_at: new Date().toISOString()
      } as Tour;
      db.tours.push(record);
    }
    this.writeDb(db);
    return record;
  }
  async deleteTour(id: string): Promise<boolean> {
    const db = this.readDb();
    const len = db.tours.length;
    db.tours = db.tours.filter((t) => t.id !== id);
    this.writeDb(db);
    return db.tours.length < len;
  }

  // Hotels
  async getHotels(): Promise<Hotel[]> {
    return this.readDb().hotels;
  }
  async saveHotel(hotel: Omit<Hotel, "id" | "created_at"> & { id?: string }): Promise<Hotel> {
    const db = this.readDb();
    let record: Hotel;
    if (hotel.id) {
      const index = db.hotels.findIndex((h) => h.id === hotel.id);
      if (index > -1) {
        record = {
          ...db.hotels[index],
          ...hotel,
          images: hotel.images || [],
          room_types: hotel.room_types || [],
          amenities: hotel.amenities || []
        } as Hotel;
        db.hotels[index] = record;
      } else {
        record = {
          ...hotel,
          id: hotel.id,
          created_at: new Date().toISOString()
        } as Hotel;
        db.hotels.push(record);
      }
    } else {
      record = {
        ...hotel,
        id: "hotel-" + generateId(),
        created_at: new Date().toISOString()
      } as Hotel;
      db.hotels.push(record);
    }
    this.writeDb(db);
    return record;
  }
  async deleteHotel(id: string): Promise<boolean> {
    const db = this.readDb();
    const len = db.hotels.length;
    db.hotels = db.hotels.filter((h) => h.id !== id);
    this.writeDb(db);
    return db.hotels.length < len;
  }

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    return this.readDb().vehicles;
  }
  async saveVehicle(vehicle: Omit<Vehicle, "id" | "created_at"> & { id?: string }): Promise<Vehicle> {
    const db = this.readDb();
    let record: Vehicle;
    if (vehicle.id) {
      const index = db.vehicles.findIndex((v) => v.id === vehicle.id);
      if (index > -1) {
        record = {
          ...db.vehicles[index],
          ...vehicle
        } as Vehicle;
        db.vehicles[index] = record;
      } else {
        record = {
          ...vehicle,
          id: vehicle.id,
          created_at: new Date().toISOString()
        } as Vehicle;
        db.vehicles.push(record);
      }
    } else {
      record = {
        ...vehicle,
        id: "veh-" + generateId(),
        created_at: new Date().toISOString()
      } as Vehicle;
      db.vehicles.push(record);
    }
    this.writeDb(db);
    return record;
  }
  async deleteVehicle(id: string): Promise<boolean> {
    const db = this.readDb();
    const len = db.vehicles.length;
    db.vehicles = db.vehicles.filter((v) => v.id !== id);
    this.writeDb(db);
    return db.vehicles.length < len;
  }

  // Guides
  async getGuides(): Promise<Guide[]> {
    return this.readDb().guides;
  }
  async saveGuide(guide: Omit<Guide, "id" | "created_at"> & { id?: string }): Promise<Guide> {
    const db = this.readDb();
    let record: Guide;
    if (guide.id) {
      const index = db.guides.findIndex((g) => g.id === guide.id);
      if (index > -1) {
        record = {
          ...db.guides[index],
          ...guide,
          languages: guide.languages || []
        } as Guide;
        db.guides[index] = record;
      } else {
        record = {
          ...guide,
          id: guide.id,
          created_at: new Date().toISOString()
        } as Guide;
        db.guides.push(record);
      }
    } else {
      record = {
        ...guide,
        id: "guide-" + generateId(),
        created_at: new Date().toISOString()
      } as Guide;
      db.guides.push(record);
    }
    this.writeDb(db);
    return record;
  }
  async deleteGuide(id: string): Promise<boolean> {
    const db = this.readDb();
    const len = db.guides.length;
    db.guides = db.guides.filter((g) => g.id !== id);
    this.writeDb(db);
    return db.guides.length < len;
  }

  // Bookings
  async getBookings(): Promise<Booking[]> {
    return this.readDb().bookings;
  }
  async getBookingsByCustomer(customerId: string): Promise<Booking[]> {
    return this.readDb().bookings.filter((b) => b.customer_id === customerId);
  }
  async getBookingById(id: string): Promise<Booking | null> {
    return this.readDb().bookings.find((b) => b.id === id) || null;
  }
  async saveBooking(booking: Omit<Booking, "id" | "created_at"> & { id?: string }): Promise<Booking> {
    const db = this.readDb();
    let record: Booking;
    if (booking.id) {
      const index = db.bookings.findIndex((b) => b.id === booking.id);
      if (index > -1) {
        record = {
          ...db.bookings[index],
          ...booking
        } as Booking;
        db.bookings[index] = record;
      } else {
        record = {
          ...booking,
          id: booking.id,
          created_at: new Date().toISOString()
        } as Booking;
        db.bookings.push(record);
      }
    } else {
      record = {
        ...booking,
        id: "bk-" + Math.floor(1000 + Math.random() * 9000).toString(),
        created_at: new Date().toISOString()
      } as Booking;
      db.bookings.push(record);
    }
    this.writeDb(db);
    return record;
  }
  async deleteBooking(id: string): Promise<boolean> {
    const db = this.readDb();
    const len = db.bookings.length;
    db.bookings = db.bookings.filter((b) => b.id !== id);
    this.writeDb(db);
    return db.bookings.length < len;
  }

  // Reviews
  async getReviews(tourId?: string, approvedOnly?: boolean): Promise<Review[]> {
    let list = this.readDb().reviews;
    if (tourId) {
      list = list.filter((r) => r.tour_id === tourId);
    }
    if (approvedOnly) {
      list = list.filter((r) => r.status === "Approved");
    }
    return list;
  }
  async saveReview(review: Omit<Review, "id" | "created_at"> & { id?: string }): Promise<Review> {
    const db = this.readDb();
    let record: Review;
    if (review.id) {
      const index = db.reviews.findIndex((r) => r.id === review.id);
      if (index > -1) {
        record = {
          ...db.reviews[index],
          ...review
        } as Review;
        db.reviews[index] = record;
      } else {
        record = {
          ...review,
          id: review.id,
          created_at: new Date().toISOString()
        } as Review;
        db.reviews.push(record);
      }
    } else {
      record = {
        ...review,
        id: "rev-" + generateId(),
        created_at: new Date().toISOString()
      } as Review;
      db.reviews.push(record);
    }
    this.writeDb(db);
    return record;
  }
  async updateReviewStatus(id: string, status: "Approved" | "Rejected"): Promise<boolean> {
    const db = this.readDb();
    const index = db.reviews.findIndex((r) => r.id === id);
    if (index > -1) {
      db.reviews[index].status = status;
      this.writeDb(db);
      return true;
    }
    return false;
  }
  async deleteReview(id: string): Promise<boolean> {
    const db = this.readDb();
    const len = db.reviews.length;
    db.reviews = db.reviews.filter((r) => r.id !== id);
    this.writeDb(db);
    return db.reviews.length < len;
  }

  // Blogs
  async getBlogs(): Promise<Blog[]> {
    return this.readDb().blogs;
  }
  async getBlogBySlug(slug: string): Promise<Blog | null> {
    return this.readDb().blogs.find((b) => b.slug === slug) || null;
  }
  async saveBlog(blog: Omit<Blog, "id" | "created_at"> & { id?: string }): Promise<Blog> {
    const db = this.readDb();
    let record: Blog;
    if (blog.id) {
      const index = db.blogs.findIndex((b) => b.id === blog.id);
      if (index > -1) {
        record = {
          ...db.blogs[index],
          ...blog
        } as Blog;
        db.blogs[index] = record;
      } else {
        record = {
          ...blog,
          id: blog.id,
          created_at: new Date().toISOString()
        } as Blog;
        db.blogs.push(record);
      }
    } else {
      record = {
        ...blog,
        id: "blog-" + generateId(),
        created_at: new Date().toISOString()
      } as Blog;
      db.blogs.push(record);
    }
    this.writeDb(db);
    return record;
  }
  async deleteBlog(id: string): Promise<boolean> {
    const db = this.readDb();
    const len = db.blogs.length;
    db.blogs = db.blogs.filter((b) => b.id !== id);
    this.writeDb(db);
    return db.blogs.length < len;
  }

  // Profiles
  async getProfiles(): Promise<Profile[]> {
    return this.readDb().profiles;
  }
  async getProfileById(id: string): Promise<Profile | null> {
    return this.readDb().profiles.find((p) => p.id === id) || null;
  }
  async getProfileByEmail(email: string): Promise<Profile | null> {
    return this.readDb().profiles.find((p) => p.email.toLowerCase() === email.toLowerCase()) || null;
  }
  async saveProfile(profile: Profile): Promise<Profile> {
    const db = this.readDb();
    const index = db.profiles.findIndex((p) => p.id === profile.id || p.email.toLowerCase() === profile.email.toLowerCase());
    if (index > -1) {
      db.profiles[index] = { ...db.profiles[index], ...profile };
      this.writeDb(db);
      return db.profiles[index];
    } else {
      db.profiles.push(profile);
      this.writeDb(db);
      return profile;
    }
  }

  // Testimonials
  async getTestimonials(featuredOnly?: boolean): Promise<Testimonial[]> {
    const list = this.readDb().testimonials || [];
    return featuredOnly ? list.filter((t) => t.featured) : list;
  }
  async saveTestimonial(t: Omit<Testimonial, "id" | "created_at"> & { id?: string }): Promise<Testimonial> {
    const db = this.readDb();
    if (!db.testimonials) db.testimonials = [];
    if (t.id) {
      const idx = db.testimonials.findIndex((x) => x.id === t.id);
      if (idx > -1) {
        db.testimonials[idx] = { ...db.testimonials[idx], ...t, id: t.id };
        this.writeDb(db);
        return db.testimonials[idx];
      }
    }
    const newItem: Testimonial = { ...t, id: generateId(), created_at: new Date().toISOString() };
    db.testimonials.push(newItem);
    this.writeDb(db);
    return newItem;
  }
  async deleteTestimonial(id: string): Promise<boolean> {
    const db = this.readDb();
    const len = db.testimonials.length;
    db.testimonials = db.testimonials.filter((t) => t.id !== id);
    this.writeDb(db);
    return db.testimonials.length < len;
  }

  // Partners
  async getPartners(): Promise<Partner[]> {
    return this.readDb().partners || [];
  }
  async savePartner(p: Omit<Partner, "id" | "created_at"> & { id?: string }): Promise<Partner> {
    const db = this.readDb();
    if (!db.partners) db.partners = [];
    if (p.id) {
      const idx = db.partners.findIndex((x) => x.id === p.id);
      if (idx > -1) {
        db.partners[idx] = { ...db.partners[idx], ...p, id: p.id };
        this.writeDb(db);
        return db.partners[idx];
      }
    }
    const newItem: Partner = { ...p, id: generateId(), created_at: new Date().toISOString() };
    db.partners.push(newItem);
    this.writeDb(db);
    return newItem;
  }
  async deletePartner(id: string): Promise<boolean> {
    const db = this.readDb();
    const len = db.partners.length;
    db.partners = db.partners.filter((p) => p.id !== id);
    this.writeDb(db);
    return db.partners.length < len;
  }

  // FAQs
  async getFaqs(): Promise<Faq[]> {
    return (this.readDb().faqs || []).sort((a, b) => a.order - b.order);
  }
  async saveFaq(f: Omit<Faq, "id" | "created_at"> & { id?: string }): Promise<Faq> {
    const db = this.readDb();
    if (!db.faqs) db.faqs = [];
    if (f.id) {
      const idx = db.faqs.findIndex((x) => x.id === f.id);
      if (idx > -1) {
        db.faqs[idx] = { ...db.faqs[idx], ...f, id: f.id };
        this.writeDb(db);
        return db.faqs[idx];
      }
    }
    const newItem: Faq = { ...f, id: generateId(), created_at: new Date().toISOString() };
    db.faqs.push(newItem);
    this.writeDb(db);
    return newItem;
  }
  async deleteFaq(id: string): Promise<boolean> {
    const db = this.readDb();
    const len = db.faqs.length;
    db.faqs = db.faqs.filter((f) => f.id !== id);
    this.writeDb(db);
    return db.faqs.length < len;
  }

  // Newsletter
  async getSubscribers(): Promise<NewsletterSubscriber[]> {
    return this.readDb().subscribers || [];
  }
  async addSubscriber(email: string): Promise<NewsletterSubscriber> {
    const db = this.readDb();
    if (!db.subscribers) db.subscribers = [];
    const existing = db.subscribers.find((s) => s.email.toLowerCase() === email.toLowerCase());
    if (existing) return existing;
    const newItem: NewsletterSubscriber = { id: generateId(), email, created_at: new Date().toISOString() };
    db.subscribers.push(newItem);
    this.writeDb(db);
    return newItem;
  }

  // Gallery
  async getGalleryImages(): Promise<GalleryImage[]> {
    return this.readDb().gallery || [];
  }
  async saveGalleryImage(g: Omit<GalleryImage, "id" | "created_at"> & { id?: string }): Promise<GalleryImage> {
    const db = this.readDb();
    if (!db.gallery) db.gallery = [];
    const newItem: GalleryImage = { ...g, id: g.id || generateId(), created_at: new Date().toISOString() };
    db.gallery.push(newItem);
    this.writeDb(db);
    return newItem;
  }
  async deleteGalleryImage(id: string): Promise<boolean> {
    const db = this.readDb();
    const len = db.gallery.length;
    db.gallery = db.gallery.filter((g) => g.id !== id);
    this.writeDb(db);
    return db.gallery.length < len;
  }

  // Social Feed
  async getSocialPosts(): Promise<SocialPost[]> {
    const posts = this.readDb().social_posts || [];
    return [...posts].sort((a, b) => a.display_order - b.display_order);
  }
  async saveSocialPost(p: Omit<SocialPost, "id" | "created_at"> & { id?: string }): Promise<SocialPost> {
    const db = this.readDb();
    if (!db.social_posts) db.social_posts = [];
    if (p.id) {
      const idx = db.social_posts.findIndex((x) => x.id === p.id);
      if (idx > -1) {
        db.social_posts[idx] = { ...db.social_posts[idx], ...p, id: p.id };
        this.writeDb(db);
        return db.social_posts[idx];
      }
    }
    const newItem: SocialPost = { ...p, id: generateId(), created_at: new Date().toISOString() };
    db.social_posts.push(newItem);
    this.writeDb(db);
    return newItem;
  }
  async deleteSocialPost(id: string): Promise<boolean> {
    const db = this.readDb();
    const len = db.social_posts.length;
    db.social_posts = db.social_posts.filter((p) => p.id !== id);
    this.writeDb(db);
    return db.social_posts.length < len;
  }

  // Audit Logs
  async getAuditLogs(limit = 100): Promise<AuditLog[]> {
    const logs = this.readDb().audit_logs || [];
    return logs.slice(-limit).reverse();
  }
  async addAuditLog(log: Omit<AuditLog, "id" | "created_at">): Promise<AuditLog> {
    const db = this.readDb();
    if (!db.audit_logs) db.audit_logs = [];
    const newItem: AuditLog = { ...log, id: generateId(), created_at: new Date().toISOString() };
    db.audit_logs.push(newItem);
    this.writeDb(db);
    return newItem;
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSettings> {
    const db = this.readDb();
    return db.settings || { id: "site-settings", updated_at: new Date().toISOString() };
  }
  async saveSiteSettings(settings: Partial<Omit<SiteSettings, "id" | "updated_at">>): Promise<SiteSettings> {
    const db = this.readDb();
    const current = db.settings || { id: "site-settings", updated_at: new Date().toISOString() };
    const updated: SiteSettings = { ...current, ...settings, id: "site-settings", updated_at: new Date().toISOString() };
    db.settings = updated;
    this.writeDb(db);
    return updated;
  }
}

export const localDb = new LocalDbAdapter();
