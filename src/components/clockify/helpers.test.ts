import { createIntl } from "react-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ClockifyTimeEntry } from "@/types/clockify.types";
import { messages } from "@/i18n/messages";
import {
  daysAgoStr,
  dayLabel,
  formatTime,
  groupByDay,
  groupByDescription,
  secsToHms,
  todayStr,
} from "./helpers";

function makeEntry(
  overrides: Partial<ClockifyTimeEntry> = {},
): ClockifyTimeEntry {
  return {
    id: "e1",
    description: "Work",
    projectId: "p1",
    tagIds: null,
    timeInterval: {
      start: "2026-06-17T09:00:00.000Z",
      end: null,
      duration: null,
    },
    workspaceId: "w1",
    billable: true,
    ...overrides,
  };
}

describe("formatTime", () => {
  it("formats HH:MM zero-padded", () => {
    expect(formatTime("2026-06-17T05:03:00.000Z")).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe("secsToHms", () => {
  it("formats hours, minutes, seconds zero-padded", () => {
    expect(secsToHms(3661)).toBe("01:01:01");
  });

  it("formats zero as 00:00:00", () => {
    expect(secsToHms(0)).toBe("00:00:00");
  });
});

describe("dayLabel", () => {
  const intl = createIntl({ locale: "en", messages: messages.en });

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-17T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'Today' for the current date key", () => {
    expect(dayLabel(todayStr(), intl)).toBe("Today");
  });

  it("returns 'Yesterday' for yesterday's date key", () => {
    expect(dayLabel(daysAgoStr(1), intl)).toBe("Yesterday");
  });

  it("returns a formatted weekday for older dates", () => {
    expect(dayLabel(daysAgoStr(5), intl)).not.toMatch(/Today|Yesterday/);
  });

  it("returns French copy when the intl locale is fr", () => {
    const frIntl = createIntl({ locale: "fr", messages: messages.fr });
    expect(dayLabel(todayStr(), frIntl)).toBe("Aujourd'hui");
  });
});

describe("groupByDescription", () => {
  it("groups entries with the same non-empty description together", () => {
    const groups = groupByDescription([
      makeEntry({ id: "1", description: "Translate" }),
      makeEntry({ id: "2", description: "Translate" }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0][1]).toHaveLength(2);
  });

  it("splits entries with empty descriptions by projectId", () => {
    const groups = groupByDescription([
      makeEntry({ id: "1", description: "", projectId: "p1" }),
      makeEntry({ id: "2", description: "", projectId: "p2" }),
    ]);

    expect(groups).toHaveLength(2);
  });

  it("falls back to a sentinel key when description and projectId are both empty", () => {
    const groups = groupByDescription([
      makeEntry({ id: "1", description: null, projectId: null }),
    ]);

    expect(groups[0][0]).toBe("__no_desc__");
  });
});

describe("groupByDay", () => {
  it("groups entries by local start date and sorts newest first", () => {
    const groups = groupByDay([
      makeEntry({
        id: "1",
        timeInterval: {
          start: "2026-06-15T09:00:00.000Z",
          end: null,
          duration: null,
        },
      }),
      makeEntry({
        id: "2",
        timeInterval: {
          start: "2026-06-17T09:00:00.000Z",
          end: null,
          duration: null,
        },
      }),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0][0] > groups[1][0]).toBe(true);
  });
});
