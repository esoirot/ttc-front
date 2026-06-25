import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatDuration,
  formatDurationWithoutSeconds,
  formatTimestamp,
  secsToH,
  secsToHms,
  timeAgo,
  toLocalIso,
} from "./time";

describe("secsToH", () => {
  it("converts seconds to hours with 1 decimal", () => {
    expect(secsToH(3600)).toBe("1.0");
    expect(secsToH(5400)).toBe("1.5");
  });
});

describe("secsToHms", () => {
  it("formats hours and minutes when hours > 0", () => {
    expect(secsToHms(3661)).toBe("1h 1m");
  });

  it("formats minutes only when under an hour", () => {
    expect(secsToHms(120)).toBe("2m");
  });
});

describe("formatDuration", () => {
  it("formats h:mm:ss", () => {
    expect(formatDuration(3661)).toBe("1:01:01");
  });

  it("pads zero seconds and minutes", () => {
    expect(formatDuration(3600)).toBe("1:00:00");
  });
});

describe("formatDurationWithoutSeconds", () => {
  it("formats h and padded minutes", () => {
    expect(formatDurationWithoutSeconds(3661)).toBe("1h 01m");
  });
});

describe("timeAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-17T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for under a minute", () => {
    expect(timeAgo(new Date("2026-06-17T11:59:30.000Z").toISOString())).toBe(
      "just now",
    );
  });

  it("returns minutes ago for under an hour", () => {
    expect(timeAgo(new Date("2026-06-17T11:55:00.000Z").toISOString())).toBe(
      "5m ago",
    );
  });

  it("returns hours ago for under a day", () => {
    expect(timeAgo(new Date("2026-06-17T09:00:00.000Z").toISOString())).toBe(
      "3h ago",
    );
  });

  it("falls back to a short date beyond a day", () => {
    expect(
      timeAgo(new Date("2026-06-10T12:00:00.000Z").toISOString()),
    ).not.toMatch(/ago|now/);
  });
});

describe("formatTimestamp", () => {
  it("includes a date and a time joined by 'at'", () => {
    const result = formatTimestamp("2026-06-17T12:30:00.000Z");
    expect(result).toContain(" at ");
  });
});

describe("toLocalIso", () => {
  it("joins date and time with a T separator and :00 seconds", () => {
    expect(toLocalIso("2026-06-17", "14:30")).toBe("2026-06-17T14:30:00");
  });
});
