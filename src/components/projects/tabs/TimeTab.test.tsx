import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

let timerSectionProps: Record<string, unknown> = {};
vi.mock("@/components/time/sections/TimerSection", () => ({
  TimerSection: (props: Record<string, unknown>) => {
    timerSectionProps = props;
    return <div data-testid="timer-section" />;
  },
}));

let entryListProps: Record<string, unknown> = {};
vi.mock("@/components/time/lists/EntryList", () => ({
  EntryList: (props: Record<string, unknown>) => {
    entryListProps = props;
    return <div data-testid="entry-list" />;
  },
}));

import { TimeTab } from "./TimeTab";

function baseProps(overrides: Partial<Parameters<typeof TimeTab>[0]> = {}) {
  return {
    projectId: 5,
    entries: [],
    loading: false,
    hasMore: false,
    loadMore: vi.fn(),
    refetch: vi.fn(),
    activeTimer: null,
    stopTimer: vi.fn(),
    stopping: false,
    deleteTimeEntry: vi.fn(),
    updateTimeEntry: vi.fn(),
    projects: [],
    tags: [],
    recentDescriptions: [],
    handleResume: vi.fn(),
    ...overrides,
  };
}

describe("TimeTab", () => {
  it("renders TimerSection and EntryList", () => {
    render(<TimeTab {...baseProps()} />);

    expect(screen.getByTestId("timer-section")).toBeInTheDocument();
    expect(screen.getByTestId("entry-list")).toBeInTheDocument();
  });

  it("passes projectId through to TimerSection as initialProjectId", () => {
    render(<TimeTab {...baseProps({ projectId: 7 })} />);

    expect(timerSectionProps.initialProjectId).toBe(7);
  });

  it("passes timer-related props through to TimerSection", () => {
    const stopTimer = vi.fn();
    const refetch = vi.fn();
    render(
      <TimeTab
        {...baseProps({
          stopTimer,
          stopping: true,
          refetch,
        })}
      />,
    );

    expect(timerSectionProps.stopTimer).toBe(stopTimer);
    expect(timerSectionProps.stopping).toBe(true);
    expect(timerSectionProps.refetch).toBe(refetch);
  });

  it("passes entry list props through, wiring onResume/onUpdate", () => {
    const entries = [{ id: 1 }];
    const handleResume = vi.fn();
    const updateTimeEntry = vi.fn();
    const deleteTimeEntry = vi.fn();
    render(
      <TimeTab
        {...baseProps({
          entries: entries as never,
          handleResume,
          updateTimeEntry,
          deleteTimeEntry,
          loading: true,
          hasMore: true,
        })}
      />,
    );

    expect(entryListProps.entries).toBe(entries);
    expect(entryListProps.loading).toBe(true);
    expect(entryListProps.hasMore).toBe(true);
    expect(entryListProps.deleteTimeEntry).toBe(deleteTimeEntry);
    expect(entryListProps.onResume).toBe(handleResume);
    expect(entryListProps.onUpdate).toBe(updateTimeEntry);
  });
});
