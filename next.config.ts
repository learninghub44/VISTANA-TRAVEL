import type { NextConfig } from "next";

// Security headers applied to every response. The app has no third-party
// scripts/analytics and serves its own images (R2/local), so the CSP can
// stay tight — 'unsafe-inline' is kept only where Next.js's own hydration
// bootstrap requires it (no nonce middleware is set up here); everything
// else is locked to 'self'.
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "media-src 'self' https:", // hero video; without this the browser blocks it (media falls back to default-src 'self')
      "connect-src 'self'", // the browser never talks to Supabase/Resend directly — everything is server-side
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

// Account, admin and auth responses must never be stored by browsers, shared
// proxies or the CDN — they contain per-user data.
const privateNoStore = [
  { key: "Cache-Control", value: "private, no-store, max-age=0" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      { source: "/admin/:path*", headers: privateNoStore },
      { source: "/portal/:path*", headers: privateNoStore },
      { source: "/api/auth/:path*", headers: privateNoStore },
    ];
  },
};

export default nextConfig;
