import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQueryClient,
  createQueryWrapper,
} from "@/test/queryClientWrapper";

const { apiGet, apiPost, apiDelete } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiDelete: vi.fn(),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, apiGet, apiPost, apiDelete };
});

import {
  useCreateGoogleCalendarEvent,
  useDisconnectGoogleCalendar,
  useGoogleCalendarEvents,
  useGoogleCalendarStatus,
} from "./useGoogleCalendar";

describe("useGoogleCalendarStatus", () => {
  beforeEach(() => {
    apiGet.mockReset();
    apiPost.mockReset();
    apiDelete.mockReset();
  });

  it("fetches connection status", async () => {
    apiGet.mockResolvedValueOnce({ connected: true, email: "u@gmail.com" });

    const { result } = renderHook(() => useGoogleCalendarStatus(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({
      connected: true,
      email: "u@gmail.com",
    });
    expect(apiGet).toHaveBeenCalledWith("/google-calendar/status");
  });
});

describe("useDisconnectGoogleCalendar", () => {
  beforeEach(() => {
    apiDelete.mockReset();
  });

  it("disconnects and invalidates google-calendar queries", async () => {
    apiDelete.mockResolvedValueOnce(undefined);
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDisconnectGoogleCalendar(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.mutateAsync();

    expect(apiDelete).toHaveBeenCalledWith("/google-calendar/disconnect");
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["google-calendar"],
    });
  });
});

describe("useGoogleCalendarEvents", () => {
  beforeEach(() => {
    apiGet.mockReset();
  });

  it("fetches events for the given time range", async () => {
    apiGet.mockResolvedValueOnce({ items: [] });

    const { result } = renderHook(
      () =>
        useGoogleCalendarEvents(
          "2026-01-01T00:00:00.000Z",
          "2026-02-01T00:00:00.000Z",
        ),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(apiGet).toHaveBeenCalledWith(
      "/google-calendar/events?timeMin=2026-01-01T00%3A00%3A00.000Z&timeMax=2026-02-01T00%3A00%3A00.000Z",
    );
    expect(result.current.data).toEqual({ items: [] });
  });

  it("does not fetch when disabled", () => {
    renderHook(
      () =>
        useGoogleCalendarEvents(
          "2026-01-01T00:00:00.000Z",
          "2026-02-01T00:00:00.000Z",
          false,
        ),
      { wrapper: createQueryWrapper() },
    );

    expect(apiGet).not.toHaveBeenCalled();
  });
});

describe("useCreateGoogleCalendarEvent", () => {
  beforeEach(() => {
    apiPost.mockReset();
  });

  it("posts the event and invalidates the events query", async () => {
    apiPost.mockResolvedValueOnce({ id: "e-new" });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateGoogleCalendarEvent(), {
      wrapper: createQueryWrapper(queryClient),
    });

    const input = {
      summary: "Call",
      startDateTime: "2026-01-01T10:00:00.000Z",
      endDateTime: "2026-01-01T11:00:00.000Z",
    };
    await result.current.mutateAsync(input);

    expect(apiPost).toHaveBeenCalledWith("/google-calendar/events", input);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["google-calendar", "events"],
    });
  });
});
