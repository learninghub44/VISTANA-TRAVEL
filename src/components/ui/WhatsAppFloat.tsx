"use client";

import { usePathname } from "next/navigation";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

/**
 * Floating "Chat on WhatsApp" button, bottom-left so it never collides with the
 * AI assistant (bottom-right). Opens a chat pre-filled with the page the
 * visitor is looking at, so the team knows which tour they're asking about.
 * Hidden in the admin area and customer portal.
 */
export default function WhatsAppFloat({ number }: { number: string | null }) {
  const pathname = usePathname() || "/";
  if (!number || pathname.startsWith("/admin") || pathname.startsWith("/portal")) return null;

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Build the message at click time so it reflects the current page title/URL.
    const url = buildWhatsAppUrl(
      number,
      `Hello Vistana Tours! I'm interested in: ${document.title.split("|")[0].trim()} ${window.location.href}`
    );
    if (url) e.currentTarget.href = url;
  };

  return (
    <a
      href={buildWhatsAppUrl(number, "Hello Vistana Tours! I'd like to plan a trip.") ?? "#"}
      onClick={onClick}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed left-4 sm:left-6 z-50 flex items-center gap-3 rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-900/30 hover:shadow-xl hover:scale-105 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
      style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
    >
      <span className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 motion-safe:animate-ping" aria-hidden="true" />
        <svg viewBox="0 0 32 32" className="relative h-7 w-7 fill-current" aria-hidden="true">
          <path d="M16.04 3C9.4 3 4 8.4 4 15.04c0 2.12.55 4.18 1.6 6L4 29l8.1-1.55a12 12 0 0 0 3.94.66C22.68 28.1 28 22.7 28 16.06 28 9.4 22.68 3 16.04 3Zm0 22.1c-1.2 0-2.38-.32-3.4-.93l-.25-.14-4.8.92.94-4.67-.16-.26a9.9 9.9 0 0 1-1.52-5.28c0-5.47 4.45-9.92 9.93-9.92 5.47 0 9.9 4.45 9.9 9.92 0 5.5-4.43 10.36-9.64 10.36Zm5.44-7.43c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
        </svg>
      </span>
      <span className="hidden sm:block pr-5 text-sm font-bold whitespace-nowrap">Chat on WhatsApp</span>
    </a>
  );
}
