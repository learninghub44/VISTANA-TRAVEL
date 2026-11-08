// In-memory FALLBACK limiter (used by rateLimitShared when the database is
// unreachable; the primary limiter is database-backed). Limitation: this
// module-level Map is scoped to a single isolate. Workers run many isolates
// in parallel across edge locations and recycle them freely, so this only
// throttles requests that happen to land on the same warm isolate — it does
// NOT provide a real, globally-consistent rate limit. It's fine as a basic
// speed bump / accidental-retry guard, but a determined attacker distributed
// across edge locations will not be meaningfully limited by this. For a real
// guarantee, swap this for Cloudflare's Rate Limiting binding or a
// Durable-Object-backed counter.
//
// Also intentionally has NO module-scope setInterval/timer: Workers isolates
// can be evicted and re-created at any time between requests, so a top-level
// timer isn't guaranteed to ever fire reliably, and long-lived global timers
// are a common source of confusing behavior in this runtime. Stale buckets
// are instead swept opportunistically on each call.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
let lastSweep = 0;
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;

function sweepStaleBuckets(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; remaining: number } {
  const now = Date.now();
  sweepStaleBuckets(now);
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { ok: false, remaining: 0 };
  }

  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count };
}

// Behind Cloudflare the only trustworthy client IP is `cf-connecting-ip`
// (set by Cloudflare itself and overwritten if a client tries to spoof it).
// `x-forwarded-for` is client-controllable — its FIRST entry is whatever the
// caller sent — so trusting it let anyone dodge every limiter by rotating a
// fake header. It is only used as a last-resort fallback for local dev.
/**
 * Preferred limiter: the counter lives in the database, so it is one global
 * count across every Cloudflare isolate and survives restarts. If the database
 * can't be reached it degrades to the per-isolate in-memory limiter rather than
 * blocking (or un-throttling) requests.
 */
export async function rateLimitShared(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ ok: boolean; remaining: number }> {
  try {
    const { db } = await import("@/services/db");
    return await db.hitRateLimit(key, limit, windowMs);
  } catch {
    return rateLimit(key, limit, windowMs);
  }
}

export function getClientIpFromHeaders(h: Pick<Headers, "get">): string {
  const cf = h.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    // Last hop is the one appended by the nearest proxy, not the client.
    const parts = forwarded.split(",").map((x) => x.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return "unknown";
}

export function getClientIp(req: Request): string {
  return getClientIpFromHeaders(req.headers);
}
