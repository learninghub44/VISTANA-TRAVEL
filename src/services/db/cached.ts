// Cached read layer for public, content-y data (destinations, tours, blog,
// etc). The raw `db` adapter (see ./index.ts) hits Supabase on every call
// with zero caching — fine for admin screens that need to be live, but
// wasteful for public pages that were re-querying the same tables on every
// request (and, in a couple of places, twice per request: once in
// generateMetadata and again in the page component).
//
// Each entry here is wrapped in Next's unstable_cache, keyed by a stable
// cache key and tagged by entity. Reads are served from the Next.js Data
// Cache for CACHE_TTL_SECONDS; mutations in src/app/actions/index.ts call
// revalidateTag(...) for the matching tag so admin edits show up immediately
// instead of waiting out the TTL.
//
// Do NOT use these wrappers for admin dashboards or anything session/user
// specific (profiles, bookings, audit logs) — those must stay live and
// per-request via the plain `db` export.
import { unstable_cache } from "next/cache";
import { db } from "./index";
import type { Booking, Review } from "./types";

const CACHE_TTL_SECONDS = 300; // 5 minutes — public content changes rarely enough that this is safe

export const CACHE_TAGS = {
  destinations: "destinations",
  tours: "tours",
  hotels: "hotels",
  guides: "guides",
  vehicles: "vehicles",
  blogs: "blogs",
  testimonials: "testimonials",
  partners: "partners",
  faqs: "faqs",
  gallery: "gallery",
  social: "social",
  reviews: "reviews",
  siteSettings: "site-settings",
} as const;

export const cachedDb = {
  getDestinations: unstable_cache(() => db.getDestinations(), ["destinations:all"], {
    tags: [CACHE_TAGS.destinations],
    revalidate: CACHE_TTL_SECONDS,
  }),
  getDestinationBySlug: (slug: string) =>
    unstable_cache((s: string) => db.getDestinationBySlug(s), ["destinations:slug", slug], {
      tags: [CACHE_TAGS.destinations],
      revalidate: CACHE_TTL_SECONDS,
    })(slug),

  getTours: unstable_cache(() => db.getTours(), ["tours:all"], {
    tags: [CACHE_TAGS.tours],
    revalidate: CACHE_TTL_SECONDS,
  }),
  getTourBySlug: (slug: string) =>
    unstable_cache((s: string) => db.getTourBySlug(s), ["tours:slug", slug], {
      tags: [CACHE_TAGS.tours],
      revalidate: CACHE_TTL_SECONDS,
    })(slug),
  getToursByDestination: (destinationId: string) =>
    unstable_cache((id: string) => db.getToursByDestination(id), ["tours:by-destination", destinationId], {
      tags: [CACHE_TAGS.tours],
      revalidate: CACHE_TTL_SECONDS,
    })(destinationId),

  getHotels: unstable_cache(() => db.getHotels(), ["hotels:all"], {
    tags: [CACHE_TAGS.hotels],
    revalidate: CACHE_TTL_SECONDS,
  }),
  getGuides: unstable_cache(() => db.getGuides(), ["guides:all"], {
    tags: [CACHE_TAGS.guides],
    revalidate: CACHE_TTL_SECONDS,
  }),
  getVehicles: unstable_cache(() => db.getVehicles(), ["vehicles:all"], {
    tags: [CACHE_TAGS.vehicles],
    revalidate: CACHE_TTL_SECONDS,
  }),

  getBlogs: unstable_cache(() => db.getBlogs(), ["blogs:all"], {
    tags: [CACHE_TAGS.blogs],
    revalidate: CACHE_TTL_SECONDS,
  }),
  getBlogBySlug: (slug: string) =>
    unstable_cache((s: string) => db.getBlogBySlug(s), ["blogs:slug", slug], {
      tags: [CACHE_TAGS.blogs],
      revalidate: CACHE_TTL_SECONDS,
    })(slug),

  getTestimonials: (featuredOnly?: boolean) =>
    unstable_cache((f?: boolean) => db.getTestimonials(f), ["testimonials", String(!!featuredOnly)], {
      tags: [CACHE_TAGS.testimonials],
      revalidate: CACHE_TTL_SECONDS,
    })(featuredOnly),

  getPartners: unstable_cache(() => db.getPartners(), ["partners:all"], {
    tags: [CACHE_TAGS.partners],
    revalidate: CACHE_TTL_SECONDS,
  }),
  getFaqs: unstable_cache(() => db.getFaqs(), ["faqs:all"], {
    tags: [CACHE_TAGS.faqs],
    revalidate: CACHE_TTL_SECONDS,
  }),
  getGalleryImages: unstable_cache(() => db.getGalleryImages(), ["gallery:all"], {
    tags: [CACHE_TAGS.gallery],
    revalidate: CACHE_TTL_SECONDS,
  }),
  getSocialPosts: unstable_cache(() => db.getSocialPosts(), ["social:all"], {
    tags: [CACHE_TAGS.social],
    revalidate: CACHE_TTL_SECONDS,
  }),

  // Only ever fetched approvedOnly=true from public pages — reviews awaiting
  // moderation are never served from here.
  getApprovedReviews: (tourId: string): Promise<Review[]> =>
    unstable_cache((id: string) => db.getReviews(id, true), ["reviews:approved", tourId], {
      tags: [CACHE_TAGS.reviews],
      revalidate: CACHE_TTL_SECONDS,
    })(tourId),

  getSiteSettings: unstable_cache(() => db.getSiteSettings(), ["site-settings:all"], {
    tags: [CACHE_TAGS.siteSettings],
    revalidate: CACHE_TTL_SECONDS,
  }),
};

// Re-exported so callers that need a live booking-availability check next to
// cached tour data don't have to import both ./index and ./cached.
export type { Booking };
