import { describe, it, expect } from "vitest";
import { escapeHtml } from "./index";

describe("escapeHtml", () => {
  it("neutralises markup injected via customer-controlled names", () => {
    const out = escapeHtml('<a href="https://evil.example">Confirm payment</a>');
    expect(out).not.toContain("<a");
    expect(out).toContain("&lt;a");
    expect(out).toContain("&quot;");
  });
  it("escapes ampersands and single quotes and tolerates null/numbers", () => {
    expect(escapeHtml("Tom & Jerry's")).toBe("Tom &amp; Jerry&#39;s");
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(3)).toBe("3");
  });
});
