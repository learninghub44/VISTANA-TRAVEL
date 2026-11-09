import { describe, it, expect } from "vitest";
import { tourSchema, slugify, uniqueSlug } from "./tourSchema";

const valid = {
  destination_id: "d1",
  title: "5-Day Maasai Mara Safari",
  slug: "",
  description: "Five unforgettable days in the Maasai Mara with game drives.",
  images: ["https://abc.supabase.co/storage/v1/object/public/images/a.jpg"],
  duration_days: 5,
  price_usd: 1800,
  category: "Safari",
  difficulty: "Easy" as const,
  inclusions: ["Park fees"],
  exclusions: [],
  pickup_location: "Nairobi",
  dropoff_location: "Nairobi",
  max_guests: 8,
  min_guests: 2,
  languages: ["English"],
  faqs: [],
  itinerary: [{ day: 1, title: "Arrival", description: "Transfer to camp" }],
};

describe("tourSchema", () => {
  it("accepts a complete package", () => {
    expect(tourSchema.safeParse(valid).success).toBe(true);
  });
  it("requires at least one photo (no more shared stock image)", () => {
    expect(tourSchema.safeParse({ ...valid, images: [] }).success).toBe(false);
  });
  it("rejects dangerous or non-https image sources", () => {
    for (const bad of ["javascript:alert(1)", "data:text/html,x", "http://insecure.example/a.jpg", "//x.com/a.jpg"]) {
      expect(tourSchema.safeParse({ ...valid, images: [bad] }).success).toBe(false);
    }
  });
  it("rejects nonsense numbers and inverted guest limits", () => {
    expect(tourSchema.safeParse({ ...valid, price_usd: 0 }).success).toBe(false);
    expect(tourSchema.safeParse({ ...valid, duration_days: 0 }).success).toBe(false);
    expect(tourSchema.safeParse({ ...valid, min_guests: 9 }).success).toBe(false);
    expect(tourSchema.safeParse({ ...valid, price_usd: Number.NaN }).success).toBe(false);
  });
  it("caps photos at 10", () => {
    const many = Array.from({ length: 11 }, (_, i) => `https://x.com/${i}.jpg`);
    expect(tourSchema.safeParse({ ...valid, images: many }).success).toBe(false);
  });
});

describe("slugs", () => {
  it("slugifies titles", () => {
    expect(slugify("  Zanzibar: Beach & Spice Escape! ")).toBe("zanzibar-beach-spice-escape");
    expect(slugify("Café Tour")).toBe("cafe-tour");
  });
  it("makes slugs unique", () => {
    expect(uniqueSlug("safari", new Set())).toBe("safari");
    expect(uniqueSlug("safari", new Set(["safari", "safari-2"]))).toBe("safari-3");
  });
});
