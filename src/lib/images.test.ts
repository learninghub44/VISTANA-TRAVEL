import { describe, it, expect } from "vitest";
import { buildSrcSet, sizedSrc, isUnsplash } from "./images";

const u = "https://images.unsplash.com/photo-123?auto=format&fit=crop&w=600&q=80";

describe("images", () => {
  it("builds a width-descriptor srcset for Unsplash URLs", () => {
    const set = buildSrcSet(u, [400, 800])!;
    expect(set).toContain("w=400");
    expect(set).toContain("w=800");
    expect(set).toMatch(/ 400w, .* 800w$/);
  });
  it("returns undefined for other hosts and empty values", () => {
    expect(buildSrcSet("https://abc.supabase.co/storage/v1/object/public/images/a.jpg")).toBeUndefined();
    expect(buildSrcSet(undefined)).toBeUndefined();
    expect(buildSrcSet("not a url")).toBeUndefined();
  });
  it("sizedSrc only rewrites Unsplash", () => {
    expect(sizedSrc(u, 1200)).toContain("w=1200");
    expect(sizedSrc("https://x.com/a.jpg", 1200)).toBe("https://x.com/a.jpg");
    expect(isUnsplash(u)).toBe(true);
  });
});
