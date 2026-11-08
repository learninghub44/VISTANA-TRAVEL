"use client";

// Last line of defence: renders when the root layout itself fails, where
// error.tsx cannot help. Must be self-contained (no site components/CSS).
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, background: "#f8fafc", color: "#0f172a" }}>
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 440, textAlign: "center" }}>
            <h1 style={{ fontSize: 28, marginBottom: 8 }}>Vistana Tours &amp; Travel</h1>
            <p style={{ color: "#475569", lineHeight: 1.6, marginBottom: 24 }}>
              We&apos;re having a temporary problem loading this page. Please try again in a moment — your bookings and
              details are safe.
            </p>
            <button
              onClick={reset}
              style={{ background: "#1e3a5f", color: "#fff", border: 0, borderRadius: 999, padding: "12px 28px", fontSize: 14, cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
