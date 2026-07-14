// In-memory rate limiter. IMPORTANT LIMITATION on Cloudflare Workers: this
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

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
