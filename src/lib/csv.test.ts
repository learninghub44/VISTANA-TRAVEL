import { describe, it, expect } from "vitest";
import { csvCell, buildCsv } from "./csv";

describe("csv", () => {
  it("neutralises spreadsheet formulas", () => {
    expect(csvCell("=HYPERLINK(\"http://evil\")")).toBe(`"'=HYPERLINK(""http://evil"")"`);
    for (const s of ["+1", "-2", "@x"]) expect(csvCell(s).startsWith(`"'`)).toBe(true);
  });
  it("escapes quotes and keeps normal text and numbers intact", () => {
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell(42)).toBe('"42"');
    expect(csvCell(null)).toBe('""');
  });
  it("builds rows with CRLF and keeps # characters", () => {
    expect(buildCsv(["a", "b"], [["x#1", "y"]])).toBe('"a","b"\r\n"x#1","y"');
  });
});
