import { describe, it, expect } from "vitest";
import { computeBookingTotal, endDateFor } from "./pricing";

describe("pricing", () => {
  it("charges children at half price and rounds to cents", () => {
    expect(computeBookingTotal(1000, 2, 2)).toBe(3000);
    expect(computeBookingTotal(333.33, 1, 1)).toBe(500);
  });
  it("computes the last day of a multi-day tour", () => {
    expect(endDateFor("2027-01-30", 5)).toBe("2027-02-03");
    expect(endDateFor("2027-01-30", 1)).toBe("2027-01-30");
  });
});
