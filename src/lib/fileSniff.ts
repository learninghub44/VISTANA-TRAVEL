/**
 * Detects a file's real type from its leading bytes. `File.type` is just a
 * header the client chose, so on its own it lets anyone upload HTML/SVG/EXE
 * labelled as "image/png". Only the types listed here are ever recognised.
 */
export type SniffedType = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

const EXTENSIONS: Record<SniffedType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function extensionFor(type: SniffedType): string {
  return EXTENSIONS[type];
}

function startsWith(bytes: Uint8Array, sig: number[], offset = 0): boolean {
  return sig.every((b, i) => bytes[offset + i] === b);
}

export function sniffFileType(bytes: Uint8Array): SniffedType | null {
  if (bytes.length < 12) return null;
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38])) return "image/gif"; // GIF8
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return "image/webp";
  return null;
}
