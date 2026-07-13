import { NextRequest, NextResponse } from "next/server";

/**
 * Defense-in-depth CSRF protection for state-changing API routes.
 *
 * Server Actions (src/app/actions) already get Next.js's built-in
 * Origin-vs-Host CSRF check for free. Raw API routes under src/app/api do
 * not, so any route that mutates state or reads/writes the session cookie
 * must call this at the top of its handler.
 *
 * Compares the request's Origin (falling back to Referer) header against
 * the Host header. A cross-site request — whether a form post, fetch, or
 * XHR triggered from another origin — will either omit Origin/Referer or
 * send one that doesn't match Host, and gets rejected.
 */
export function verifyOrigin(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");

  if (!host) {
    return NextResponse.json({ error: "Invalid request" }, { status: 403 });
  }

  let sourceHost: string | null = null;
  try {
    if (origin) {
      sourceHost = new URL(origin).host;
    } else if (referer) {
      sourceHost = new URL(referer).host;
    }
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 403 });
  }

  // No Origin and no Referer at all — most legitimate same-origin
  // fetch/XHR requests always send Origin, so reject rather than guess.
  if (!sourceHost) {
    return NextResponse.json({ error: "Invalid request" }, { status: 403 });
  }

  if (sourceHost !== host) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  return null;
}
