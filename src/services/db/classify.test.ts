import { describe, it, expect } from "vitest";
import { classifyDbError } from "./resilient";

describe("classifyDbError", () => {
  it("recognises missing grants", () => {
    expect(classifyDbError({ code: "42501", message: "permission denied for table blogs" })).toBe("permission_denied");
  });
  it("recognises missing tables", () => {
    expect(classifyDbError({ code: "PGRST205", message: "Could not find the table 'public.tours'" })).toBe("missing_tables");
  });
  it("recognises a bad API key", () => {
    expect(classifyDbError({ status: 401, message: "Invalid API key" })).toBe("bad_key");
  });
  it("recognises an unreachable database", () => {
    expect(classifyDbError(new Error("fetch failed"))).toBe("unreachable");
    expect(classifyDbError(new Error("error code: 1016"))).toBe("unreachable");
  });
  it("falls back to unknown without leaking details", () => {
    expect(classifyDbError(new Error("something odd"))).toBe("unknown");
  });
});
