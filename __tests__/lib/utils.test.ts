import { cn, formatDate, formatDateTime, toDateString } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "skip", "keep")).toBe("base keep");
  });

  it("resolves tailwind conflicts (last wins)", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles undefined and null gracefully", () => {
    expect(cn("a", undefined, null, "b")).toBe("a b");
  });
});

describe("formatDate", () => {
  it("formats a Date object", () => {
    expect(formatDate(new Date("2026-11-10"))).toBe("Nov 10, 2026");
  });

  it("formats an ISO string", () => {
    expect(formatDate("2026-01-05")).toBe("Jan 5, 2026");
  });

  it("handles single-digit days", () => {
    expect(formatDate(new Date("2026-03-01"))).toBe("Mar 1, 2026");
  });
});

describe("formatDateTime", () => {
  it("formats a Date object with time", () => {
    const d = new Date("2026-11-10T14:30:00.000Z");
    const result = formatDateTime(d);
    expect(result).toMatch(/Nov 10, 2026/);
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it("formats an ISO string", () => {
    const result = formatDateTime("2026-06-15T09:05:00.000Z");
    expect(result).toMatch(/Jun 15, 2026/);
  });
});

describe("toDateString", () => {
  it("formats date as yyyy-MM-dd", () => {
    expect(toDateString(new Date("2026-11-10"))).toBe("2026-11-10");
  });

  it("zero-pads month and day", () => {
    expect(toDateString(new Date("2026-01-05"))).toBe("2026-01-05");
  });
});
