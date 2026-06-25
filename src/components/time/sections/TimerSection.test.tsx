import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../banners/ActiveTimerBanner", () => ({
  ActiveTimerBanner: () => <div data-testid="active-timer-banner" />,
}));
vi.mock("../form-inputs/TimerStartInput", () => ({
  TimerStartInput: () => <div data-testid="timer-start-input" />,
}));

import type { TimeEntry } from "@/types/time-entries.types";
import { TimerSection } from "./TimerSection";

function makeProps(
  overrides: Partial<Parameters<typeof TimerSection>[0]> = {},
) {
  return {
    activeTimer: null,
    stopTimer: vi.fn(),
    stopping: false,
    refetch: vi.fn(),
    projects: [],
    tags: [],
    recentDescriptions: [],
    ...overrides,
  };
}

function makeTimer(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return {
    id: 1,
    userId: 1,
    projectId: null,
    description: "Working",
    startTime: "2026-06-01T10:00:00.000Z",
    endTime: null,
    durationSeconds: null,
    billable: true,
    clockifyEntryId: null,
    tags: [],
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("TimerSection", () => {
  it("renders TimerStartInput when there is no active timer", () => {
    render(<TimerSection {...makeProps({ activeTimer: null })} />);

    expect(screen.getByTestId("timer-start-input")).toBeInTheDocument();
    expect(screen.queryByTestId("active-timer-banner")).not.toBeInTheDocument();
  });

  it("renders ActiveTimerBanner when there is an active timer", () => {
    render(<TimerSection {...makeProps({ activeTimer: makeTimer() })} />);

    expect(screen.getByTestId("active-timer-banner")).toBeInTheDocument();
    expect(screen.queryByTestId("timer-start-input")).not.toBeInTheDocument();
  });

  it("renders TimerStartInput when activeTimer is undefined", () => {
    render(<TimerSection {...makeProps({ activeTimer: undefined })} />);

    expect(screen.getByTestId("timer-start-input")).toBeInTheDocument();
  });
});
