import { describe, it, expect } from "vitest";
import { sniffFileType, extensionFor } from "./fileSniff";

const pad = (bytes: number[]) => Uint8Array.from([...bytes, ...new Array(16).fill(0)]);

describe("sniffFileType", () => {
  it("detects JPEG, PNG, GIF and WEBP by magic bytes", () => {
    expect(sniffFileType(pad([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(sniffFileType(pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("image/png");
    expect(sniffFileType(pad([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]))).toBe("image/gif");
    expect(sniffFileType(pad([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]))).toBe("image/webp");
    expect(sniffFileType(pad([0x25, 0x50, 0x44, 0x46, 0x2d]))).toBeNull(); // PDFs are not accepted anywhere
  });

  it("rejects HTML/SVG/script content pretending to be an image", () => {
    const html = new TextEncoder().encode("<html><script>alert(1)</script></html>");
    const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script/></svg>');
    expect(sniffFileType(html)).toBeNull();
    expect(sniffFileType(svg)).toBeNull();
  });

  it("rejects empty and tiny files", () => {
    expect(sniffFileType(new Uint8Array())).toBeNull();
    expect(sniffFileType(Uint8Array.from([0xff, 0xd8]))).toBeNull();
  });

  it("maps types to safe extensions", () => {
    expect(extensionFor("image/jpeg")).toBe("jpg");
    expect(extensionFor("image/png")).toBe("png");
  });
});
