import { z } from "zod";

export const LEAD_SOURCES = ["contact", "newsletter", "meeting", "quote", "assistant"] as const;
export const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Won", "Lost"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const quoteSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: z.string().trim().max(24).regex(/^[0-9+()\-\s]*$/, "Invalid phone number").optional(),
  tour_slug: z.string().trim().min(1).max(140),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  adults: z.number().int().min(1).max(50),
  children: z.number().int().min(0).max(50),
  message: z.string().trim().max(1500).optional(),
  website: z.string().max(200).optional(), // honeypot
});

export const leadUpdateSchema = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  notes: z.string().trim().max(3000).optional(),
});
