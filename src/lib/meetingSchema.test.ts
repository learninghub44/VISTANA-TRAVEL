import { describe, it, expect } from "vitest";
import { isValidMeetingSlot, todayEAT, meetingSchema } from "./meetingSchema";

// 2027-03-01 06:00 UTC = 09:00 EAT
const NOW = Date.parse("2027-03-01T06:00:00Z");

describe("meeting slots (East Africa Time)", () => {
  it("accepts a normal future slot in office hours", () => {
    expect(isValidMeetingSlot("2027-03-03", "10:00", NOW)).toBeNull();
  });
  it("rejects slots outside 08:00-18:00", () => {
    expect(isValidMeetingSlot("2027-03-03", "07:30", NOW)).toMatch(/08:00 and 18:00/);
    expect(isValidMeetingSlot("2027-03-03", "19:00", NOW)).toMatch(/08:00 and 18:00/);
  });
  it("rejects past slots and slots under 2 hours away", () => {
    expect(isValidMeetingSlot("2027-02-28", "10:00", NOW)).toMatch(/2 hours/);
    expect(isValidMeetingSlot("2027-03-01", "10:00", NOW)).toMatch(/2 hours/);
    expect(isValidMeetingSlot("2027-03-01", "12:00", NOW)).toBeNull();
  });
  it("rejects slots more than 60 days away and malformed input", () => {
    expect(isValidMeetingSlot("2027-06-01", "10:00", NOW)).toMatch(/60 days/);
    expect(isValidMeetingSlot("soon", "10:00", NOW)).toMatch(/valid date/);
    expect(isValidMeetingSlot("2027-03-03", "10am", NOW)).toMatch(/valid time/);
  });
  it("computes today in EAT (UTC+3)", () => {
    expect(todayEAT(Date.parse("2027-03-01T22:00:00Z"))).toBe("2027-03-02");
  });
});

describe("meetingSchema", () => {
  const ok = { name: "Amina W", email: "A@x.com", topic: "Honeymoon safari", channel: "Video call", preferred_date: "2027-03-03", preferred_time: "10:00" };
  it("normalises email and accepts valid input", () => {
    const r = meetingSchema.safeParse(ok);
    expect(r.success && r.data.email).toBe("a@x.com");
  });
  it("rejects an unknown channel", () => {
    expect(meetingSchema.safeParse({ ...ok, channel: "Carrier pigeon" }).success).toBe(false);
  });
});
