import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQueryClient,
  createQueryWrapper,
} from "@/test/queryClientWrapper";
import { FakeEventSource } from "@/test/fakeEventSource";
import { MOCK_AUTH_USER } from "@/test/authUserFixture";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { useTimerSSE } from "./useTimerSSE";

describe("useTimerSSE", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    FakeEventSource.reset();
    vi.stubGlobal("EventSource", FakeEventSource);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("does not connect when there is no authenticated user", async () => {
    gqlFetch.mockResolvedValueOnce({ me: null });

    renderHook(() => useTimerSSE(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(gqlFetch).toHaveBeenCalled());
    expect(FakeEventSource.instances).toHaveLength(0);
  });

  it("connects to /timer/events with credentials once a user is loaded", async () => {
    gqlFetch.mockResolvedValueOnce({ me: MOCK_AUTH_USER });

    renderHook(() => useTimerSSE(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    const es = FakeEventSource.last();
    expect(es.url).toBe("http://localhost:3000/timer/events");
    expect(es.withCredentials).toBe(true);
  });

  it("writes a timer payload into the activeTimer cache", async () => {
    gqlFetch.mockResolvedValueOnce({ me: MOCK_AUTH_USER });
    const queryClient = createQueryClient();

    renderHook(() => useTimerSSE(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    FakeEventSource.last().emitMessage({ id: 5, description: "Work" });

    expect(queryClient.getQueryData(["activeTimer"])).toEqual({
      id: 5,
      description: "Work",
    });
  });

  it("ignores control messages that carry a type field", async () => {
    gqlFetch.mockResolvedValueOnce({ me: MOCK_AUTH_USER });
    const queryClient = createQueryClient();
    queryClient.setQueryData(["activeTimer"], "untouched");

    renderHook(() => useTimerSSE(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    FakeEventSource.last().emitMessage({ type: "connected" });

    expect(queryClient.getQueryData(["activeTimer"])).toBe("untouched");
  });

  it("reconnects with exponential backoff after an error", async () => {
    vi.useFakeTimers();
    gqlFetch.mockResolvedValueOnce({ me: MOCK_AUTH_USER });

    renderHook(() => useTimerSSE(), { wrapper: createQueryWrapper() });

    await vi.waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    FakeEventSource.last().emitError();
    expect(FakeEventSource.instances).toHaveLength(1);

    await vi.advanceTimersByTimeAsync(2000);
    expect(FakeEventSource.instances).toHaveLength(2);
  });

  it("closes the connection and clears the retry timer on unmount", async () => {
    gqlFetch.mockResolvedValueOnce({ me: MOCK_AUTH_USER });

    const { unmount } = renderHook(() => useTimerSSE(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    const es = FakeEventSource.last();
    unmount();

    expect(es.closed).toBe(true);
  });
});
