import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useElapsedTimerMock = vi.fn();
vi.mock("@/hooks/time/useElapsedTimer", () => ({
  useElapsedTimer: () => useElapsedTimerMock(),
}));

import type { TimeEntry } from "@/types/time-entries.types";
import { ActiveTimerBanner } from "./ActiveTimerBanner";

function makeTimer(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return {
    id: 1,
    userId: 1,
    projectId: null,
    description: "Translating",
    startTime: "2026-06-01T10:15:00.000Z",
    endTime: null,
    durationSeconds: null,
    billable: true,
    clockifyEntryId: null,
    tags: [],
    createdAt: "2026-06-01T10:15:00.000Z",
    updatedAt: "2026-06-01T10:15:00.000Z",
    ...overrides,
  };
}

describe("ActiveTimerBanner", () => {
  beforeEach(() => {
    useElapsedTimerMock.mockReset();
    useElapsedTimerMock.mockReturnValue("0:05:00");
  });

  it("shows the description, start time, and elapsed time", () => {
    render(
      <ActiveTimerBanner
        activeTimer={makeTimer()}
        stopTimer={vi.fn()}
        stopping={false}
        refetch={vi.fn()}
      />,
    );

    expect(screen.getByText("Translating")).toBeInTheDocument();
    expect(screen.getByText("Started 2026-06-01 10:15")).toBeInTheDocument();
    expect(screen.getByText("0:05:00")).toBeInTheDocument();
  });

  it("shows 'No description' when description is null", () => {
    render(
      <ActiveTimerBanner
        activeTimer={makeTimer({ description: null })}
        stopTimer={vi.fn()}
        stopping={false}
        refetch={vi.fn()}
      />,
    );

    expect(screen.getByText("No description")).toBeInTheDocument();
  });

  it("renders a badge per tag", () => {
    render(
      <ActiveTimerBanner
        activeTimer={makeTimer({
          tags: [
            { id: 1, name: "Urgent" },
            { id: 2, name: "Client A" },
          ],
        })}
        stopTimer={vi.fn()}
        stopping={false}
        refetch={vi.fn()}
      />,
    );

    expect(screen.getByText("Urgent")).toBeInTheDocument();
    expect(screen.getByText("Client A")).toBeInTheDocument();
  });

  it("does not render an elapsed line when the hook returns an empty string", () => {
    useElapsedTimerMock.mockReturnValue("");
    render(
      <ActiveTimerBanner
        activeTimer={makeTimer()}
        stopTimer={vi.fn()}
        stopping={false}
        refetch={vi.fn()}
      />,
    );

    expect(screen.queryByText(/^\d+:\d{2}:\d{2}$/)).not.toBeInTheDocument();
  });

  it("stops the timer and refetches when Stop is clicked", async () => {
    const stopTimer = vi.fn().mockResolvedValue(undefined);
    const refetch = vi.fn();
    render(
      <ActiveTimerBanner
        activeTimer={makeTimer()}
        stopTimer={stopTimer}
        stopping={false}
        refetch={refetch}
      />,
    );

    fireEvent.click(screen.getByText("⏹ Stop"));

    expect(stopTimer).toHaveBeenCalled();
    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });

  it("disables the button and shows 'Stopping…' while stopping", () => {
    render(
      <ActiveTimerBanner
        activeTimer={makeTimer()}
        stopTimer={vi.fn()}
        stopping={true}
        refetch={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Stopping…" })).toBeDisabled();
  });
});
