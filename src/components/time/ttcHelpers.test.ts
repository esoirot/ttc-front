import { describe, expect, it } from "vitest";
import type { TimeEntry } from "@/types/time-entries.types";
import { groupByDay, groupByDescription } from "./ttcHelpers";

function makeEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return {
    id: 1,
    userId: 1,
    projectId: null,
    description: "Work",
    startTime: "2026-06-01T10:00:00.000Z",
    endTime: "2026-06-01T11:00:00.000Z",
    durationSeconds: 3600,
    billable: true,
    clockifyEntryId: null,
    tags: [],
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("groupByDay", () => {
  it("groups entries by local calendar day", () => {
    const a = makeEntry({ id: 1, startTime: "2026-06-01T10:00:00.000Z" });
    const b = makeEntry({ id: 2, startTime: "2026-06-01T15:00:00.000Z" });
    const c = makeEntry({ id: 3, startTime: "2026-06-02T08:00:00.000Z" });

    const groups = groupByDay([a, b, c]);

    expect(groups).toHaveLength(2);
    const [day1, day2] = groups;
    expect(day1[1]).toEqual([c]);
    expect(day2[1]).toEqual([a, b]);
  });

  it("sorts groups newest day first", () => {
    const old = makeEntry({ id: 1, startTime: "2026-01-01T10:00:00.000Z" });
    const recent = makeEntry({ id: 2, startTime: "2026-06-01T10:00:00.000Z" });

    const groups = groupByDay([old, recent]);

    expect(groups[0][1]).toEqual([recent]);
    expect(groups[1][1]).toEqual([old]);
  });

  it("returns an empty array for no entries", () => {
    expect(groupByDay([])).toEqual([]);
  });
});

describe("groupByDescription", () => {
  it("groups entries with the same non-empty description together", () => {
    const a = makeEntry({ id: 1, description: "Translate" });
    const b = makeEntry({ id: 2, description: "Translate" });
    const c = makeEntry({ id: 3, description: "Review" });

    const groups = groupByDescription([a, b, c]);

    expect(groups).toEqual([
      ["Translate", [a, b]],
      ["Review", [c]],
    ]);
  });

  it("trims whitespace from descriptions when grouping", () => {
    const a = makeEntry({ id: 1, description: "Translate" });
    const b = makeEntry({ id: 2, description: "  Translate  " });

    const groups = groupByDescription([a, b]);

    expect(groups).toEqual([["Translate", [a, b]]]);
  });

  it("splits entries with no description by projectId", () => {
    const a = makeEntry({ id: 1, description: null, projectId: 5 });
    const b = makeEntry({ id: 2, description: "", projectId: 9 });

    const groups = groupByDescription([a, b]);

    expect(groups).toEqual([
      ["5", [a]],
      ["9", [b]],
    ]);
  });

  it("falls back to a shared bucket for no description and no project", () => {
    const a = makeEntry({ id: 1, description: null, projectId: null });
    const b = makeEntry({ id: 2, description: "  ", projectId: null });

    const groups = groupByDescription([a, b]);

    expect(groups).toEqual([["__no_desc__", [a, b]]]);
  });
});
