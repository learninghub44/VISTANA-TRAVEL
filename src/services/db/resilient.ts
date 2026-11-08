/**
 * Resilience layer for the database adapter.
 *
 * Before this, one unreachable Supabase host meant EVERY page threw: the footer
 * (rendered on every route) reads site settings, so a dead database became a
 * site-wide 500. This wrapper keeps the site standing through database trouble:
 *
 *  - timeout     every call is bounded (a hung DB can't hang the page)
 *  - retry       reads get one quick retry for transient network blips
 *  - circuit     after repeated failures calls fail instantly for a short
 *    breaker     cool-down instead of each request waiting out a timeout
 *  - stale cache reads fall back to the last good result (up to 24h old)
 *                when the database is down, so pages keep showing real tours
 *
 * Writes get the timeout and breaker but are NEVER retried or served stale —
 * retrying a booking could double-submit it.
 */

export interface ResilienceOptions {
  timeoutMs: number;
  retries: number;
  failureThreshold: number;
  cooldownMs: number;
  staleTtlMs: number;
  now: () => number;
}

const DEFAULTS: ResilienceOptions = {
  timeoutMs: 5000,
  retries: 1,
  failureThreshold: 3,
  cooldownMs: 15_000,
  staleTtlMs: 24 * 60 * 60 * 1000,
  now: () => Date.now(),
};

export class DatabaseUnavailableError extends Error {
  constructor(message = "The database is temporarily unavailable.") {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new DatabaseUnavailableError(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(timer));
}

const isRead = (method: string) => method.startsWith("get");

export function withResilience<T extends object>(adapter: T, options: Partial<ResilienceOptions> = {}): T {
  const opts = { ...DEFAULTS, ...options };
  const stale = new Map<string, { value: unknown; at: number }>();
  let consecutiveFailures = 0;
  let openUntil = 0;

  const recordSuccess = () => {
    consecutiveFailures = 0;
    openUntil = 0;
  };
  const recordFailure = () => {
    consecutiveFailures += 1;
    if (consecutiveFailures >= opts.failureThreshold) openUntil = opts.now() + opts.cooldownMs;
  };

  return new Proxy(adapter, {
    get(target, prop, receiver) {
      const original = Reflect.get(target, prop, receiver);
      if (typeof original !== "function" || typeof prop !== "string") return original;

      const read = isRead(prop);
      const call = (args: unknown[]) => (original as (...a: unknown[]) => Promise<unknown>).apply(target, args);

      return async (...args: unknown[]) => {
        const key = read ? `${prop}:${JSON.stringify(args)}` : "";
        const serveStale = (cause: unknown) => {
          const hit = read ? stale.get(key) : undefined;
          if (hit && opts.now() - hit.at <= opts.staleTtlMs) {
            console.warn(`[Vistana DB] ${prop} failed; serving stale data (${Math.round((opts.now() - hit.at) / 1000)}s old).`);
            return hit.value;
          }
          throw cause instanceof Error ? cause : new DatabaseUnavailableError();
        };

        // Circuit open: don't even try — fail fast (or serve stale) so requests
        // aren't each stuck waiting for a database we already know is down.
        if (opts.now() < openUntil) {
          return serveStale(new DatabaseUnavailableError("Database circuit open — failing fast."));
        }

        const attempts = read ? opts.retries + 1 : 1;
        let lastError: unknown;
        for (let i = 0; i < attempts; i++) {
          try {
            const result = await withTimeout(call(args), opts.timeoutMs, prop);
            recordSuccess();
            if (read) stale.set(key, { value: result, at: opts.now() });
            return result;
          } catch (e) {
            lastError = e;
            // Real data errors (e.g. a constraint violation) aren't outages:
            // only network/timeout-style failures count against the breaker.
            if (!isConnectivityError(e)) throw e;
          }
        }
        recordFailure();
        return serveStale(lastError);
      };
    },
  });
}

function isConnectivityError(e: unknown): boolean {
  if (e instanceof DatabaseUnavailableError) return true;
  const msg = (e instanceof Error ? e.message : String((e as { message?: unknown })?.message ?? e)).toLowerCase();
  return (
    msg.includes("fetch failed") ||
    msg.includes("network") ||
    msg.includes("timed out") ||
    msg.includes("timeout") ||
    msg.includes("econnrefused") ||
    msg.includes("enotfound") ||
    msg.includes("error code: 1016") ||
    msg.includes("502") ||
    msg.includes("503") ||
    msg.includes("504") ||
    msg.includes("<html")
  );
}
