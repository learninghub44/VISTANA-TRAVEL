/**
 * Responsive image helpers. The app renders plain <img> (not next/image) so it
 * works on Cloudflare Workers without an image-optimisation binding and with
 * admin-entered URLs from any host. For Unsplash URLs we can still serve
 * right-sized files by rewriting the `w` parameter into a srcset.
 */
export const DEFAULT_WIDTHS = [400, 640, 960, 1280, 1600, 1920];

export function isUnsplash(url: string): boolean {
  try {
    return new URL(url).hostname === "images.unsplash.com";
  } catch {
    return false;
  }
}

export function withUnsplashWidth(url: string, width: number): string {
  const u = new URL(url);
  u.searchParams.set("w", String(width));
  u.searchParams.set("auto", "format");
  u.searchParams.set("fit", "crop");
  if (!u.searchParams.has("q")) u.searchParams.set("q", "80");
  return u.toString();
}

/** srcset for hosts that support width resizing; undefined otherwise (browser uses `src`). */
export function buildSrcSet(url: string | undefined | null, widths: number[] = DEFAULT_WIDTHS): string | undefined {
  if (!url || !isUnsplash(url)) return undefined;
  return widths.map((w) => `${withUnsplashWidth(url, w)} ${w}w`).join(", ");
}

/** Best single-file URL for a given display width. */
export function sizedSrc(url: string, width: number): string {
  return isUnsplash(url) ? withUnsplashWidth(url, width) : url;
}
