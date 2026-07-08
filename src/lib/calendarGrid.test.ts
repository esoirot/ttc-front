import { describe, expect, it } from "vitest";
import { buildMonthMatrix, isSameDay, toDateKey } from "./calendarGrid";

describe("buildMonthMatrix", () => {
  it("returns 6 weeks of 7 days", () => {
    const weeks = buildMonthMatrix(2026, 6); // July 2026
    expect(weeks).toHaveLength(6);
    weeks.forEach((week) => expect(week).toHaveLength(7));
  });

  it("starts the grid on the Sunday before (or on) the 1st", () => {
    const weeks = buildMonthMatrix(2026, 6); // July 1, 2026 is a Wednesday
    const firstCell = weeks[0][0];
    const firstOfMonth = new Date(2026, 6, 1);
    expect(firstCell.getDay()).toBe(0);
    expect(firstCell.getTime()).toBeLessThanOrEqual(firstOfMonth.getTime());
  });

  it("includes the 1st of the month somewhere in the first week", () => {
    const weeks = buildMonthMatrix(2026, 6);
    const firstOfMonth = weeks[0].find(
      (d) => d.getMonth() === 6 && d.getDate() === 1,
    );
    expect(firstOfMonth).toBeDefined();
  });

  it("includes the last day of the month", () => {
    const weeks = buildMonthMatrix(2026, 6); // July has 31 days
    const flat = weeks.flat();
    const last = flat.find((d) => d.getMonth() === 6 && d.getDate() === 31);
    expect(last).toBeDefined();
  });
});

describe("toDateKey", () => {
  it("formats as YYYY-MM-DD", () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("pads single-digit month and day", () => {
    expect(toDateKey(new Date(2026, 8, 9))).toBe("2026-09-09");
  });
});

describe("isSameDay", () => {
  it("returns true for same calendar day, different times", () => {
    expect(
      isSameDay(new Date(2026, 0, 5, 8, 0), new Date(2026, 0, 5, 23, 30)),
    ).toBe(true);
  });

  it("returns false for different days", () => {
    expect(isSameDay(new Date(2026, 0, 5), new Date(2026, 0, 6))).toBe(false);
  });
});
