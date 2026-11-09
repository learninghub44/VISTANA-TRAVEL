/** Digits only, 8–15 long (E.164 allows up to 15). Returns null if it can't be a real number. */
export function normalizeWhatsAppNumber(raw: string | null | undefined): string | null {
  const digits = String(raw ?? "").replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

export function buildWhatsAppUrl(raw: string | null | undefined, message?: string): string | null {
  const number = normalizeWhatsAppNumber(raw);
  if (!number) return null;
  const text = message ? `?text=${encodeURIComponent(message.slice(0, 500))}` : "";
  return `https://wa.me/${number}${text}`;
}
