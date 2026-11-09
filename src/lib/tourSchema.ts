import { z } from "zod";

// Image sources an admin may attach to a package: https URLs, or (local dev
// only) paths served from /uploads/. Rejects javascript:, data:, http:, etc.
const imageSource = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => /^https:\/\//i.test(v) || /^\/uploads\/[\w.\-]+$/.test(v), "Images must be https links or uploaded files");

const text = (max: number) => z.string().trim().max(max);
const list = (max: number, itemMax = 300) => z.array(text(itemMax).min(1)).max(max);

export const tourSchema = z
  .object({
    id: z.string().min(1).max(64).optional(),
    destination_id: z.string().min(1, "Choose a destination"),
    title: text(120).min(3, "Title must be at least 3 characters"),
    slug: z.string().trim().max(140).optional().default(""),
    description: text(6000).min(20, "Description must be at least 20 characters"),
    images: z.array(imageSource).min(1, "Add at least one photo of the package").max(10, "Up to 10 photos per package"),
    duration_days: z.number().int().min(1, "Duration must be at least 1 day").max(90),
    price_usd: z.number().min(1, "Price must be greater than 0").max(1_000_000),
    category: text(40).min(2, "Category is required"),
    difficulty: z.enum(["Easy", "Moderate", "Hard", "Challenging"]),
    inclusions: list(40),
    exclusions: list(40),
    pickup_location: text(200),
    dropoff_location: text(200),
    max_guests: z.number().int().min(1).max(500),
    min_guests: z.number().int().min(1).max(500),
    languages: z.array(text(40).min(1)).max(10),
    guide_id: z.string().optional(),
    faqs: z.array(z.object({ question: text(300).min(1), answer: text(2000).min(1) })).max(30),
    itinerary: z
      .array(z.object({ day: z.number().int().min(1).max(90), title: text(200).min(1), description: text(3000) }))
      .max(90),
  })
  .refine((t) => t.min_guests <= t.max_guests, { message: "Minimum guests can't exceed maximum guests", path: ["min_guests"] });

export type TourInput = z.infer<typeof tourSchema>;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

/** Returns `base`, or `base-2`, `base-3`… so two packages never share a URL. */
export function uniqueSlug(base: string, taken: Set<string>): string {
  const root = base || "tour";
  if (!taken.has(root)) return root;
  let n = 2;
  while (taken.has(`${root}-${n}`)) n++;
  return `${root}-${n}`;
}
