/** Adults pay full price, children 50%. Rounded to cents. Single source of truth for UI, assistant and server. */
export const CHILD_PRICE_RATIO = 0.5;

export function computeBookingTotal(pricePerAdult: number, adults: number, children: number): number {
  return Math.round((adults * pricePerAdult + children * pricePerAdult * CHILD_PRICE_RATIO) * 100) / 100;
}

/** `start` + (days - 1) as YYYY-MM-DD (UTC math, no timezone drift). */
export function endDateFor(startISO: string, durationDays: number): string {
  const d = new Date(`${startISO}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + Math.max(durationDays, 1) - 1);
  return d.toISOString().slice(0, 10);
}
