import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatDateDDMMYYYY,
  formatDuration,
  formatDurationWithoutSeconds,
  formatTimestamp,
  secsToH,
  secsToHms,
  timeAgo,
  toLocalIso,
  toStartIso,
  toEndIso,
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

describe("formatDateDDMMYYYY", () => {
  it("formats an ISO date string as DD/MM/YYYY", () => {
    expect(formatDateDDMMYYYY("2026-12-31T00:00:00.000Z")).toBe("31/12/2026");
  });

  it("keeps zero-padded day and month", () => {
    expect(formatDateDDMMYYYY("2026-01-05T00:00:00.000Z")).toBe("05/01/2026");
  });
});

describe("toLocalIso", () => {
  it("turns a local date + time into an absolute UTC instant", () => {
    expect(toLocalIso("2026-06-17", "14:30")).toBe(
      new Date(2026, 5, 17, 14, 30).toISOString(),
    );
  });
});

describe("toStartIso / toEndIso", () => {
  it("anchors the start of a local day to 00:00:00", () => {
    expect(toStartIso("2026-06-17")).toBe(
      new Date(2026, 5, 17, 0, 0, 0, 0).toISOString(),
    );
  });

  it("anchors the end of a local day to 23:59:59.999", () => {
    expect(toEndIso("2026-06-17")).toBe(
      new Date(2026, 5, 17, 23, 59, 59, 999).toISOString(),
    );
  });
});
