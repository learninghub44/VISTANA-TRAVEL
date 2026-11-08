import { NextResponse } from "next/server";

/** Parses a JSON body; returns null (instead of throwing → 500) when malformed. */
export async function readJson(req: Request): Promise<unknown | null> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

export function badRequest(message = "Invalid request") {
  return NextResponse.json({ error: message }, { status: 400 });
}

/** Lowercase + trim so "Jane@X.com" and "jane@x.com" are the same account. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Canonical site origin for links/redirects — never derived from request headers. */
export function appOrigin(req?: Request): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, "");
  if (req) return new URL(req.url).origin;
  return "http://localhost:3000";
}
