import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { replaceLocation } = vi.hoisted(() => ({ replaceLocation: vi.fn() }));
vi.mock("@/lib/navigation", () => ({ replaceLocation }));
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

import { useAuthSSE } from "./useAuthSSE";

describe("useAuthSSE", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    FakeEventSource.reset();
    vi.stubGlobal("EventSource", FakeEventSource);
    replaceLocation.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("does not connect when there is no authenticated user", async () => {
    gqlFetch.mockResolvedValueOnce({ me: null });

    renderHook(() => useAuthSSE(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(gqlFetch).toHaveBeenCalled());
    expect(FakeEventSource.instances).toHaveLength(0);
  });

  it("connects to /auth/events with credentials once a user is loaded", async () => {
    gqlFetch.mockResolvedValueOnce({ me: MOCK_AUTH_USER });

    renderHook(() => useAuthSSE(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    const es = FakeEventSource.last();
    expect(es.url).toBe("http://localhost:3000/auth/events");
    expect(es.withCredentials).toBe(true);
  });

  it("clears the cache and redirects to /login on session_revoked", async () => {
    gqlFetch.mockResolvedValueOnce({ me: MOCK_AUTH_USER });
    const queryClient = createQueryClient();
    const clearSpy = vi.spyOn(queryClient, "clear");

    renderHook(() => useAuthSSE(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    FakeEventSource.last().emitMessage({ type: "session_revoked" });

    expect(clearSpy).toHaveBeenCalled();
    expect(replaceLocation).toHaveBeenCalledWith("/login");
  });

  it("ignores other control messages like 'connected'", async () => {
    gqlFetch.mockResolvedValueOnce({ me: MOCK_AUTH_USER });
    const queryClient = createQueryClient();
    const clearSpy = vi.spyOn(queryClient, "clear");

    renderHook(() => useAuthSSE(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    FakeEventSource.last().emitMessage({ type: "connected" });

    expect(clearSpy).not.toHaveBeenCalled();
    expect(replaceLocation).not.toHaveBeenCalled();
  });

  it("closes the connection on unmount", async () => {
    gqlFetch.mockResolvedValueOnce({ me: MOCK_AUTH_USER });

    const { unmount } = renderHook(() => useAuthSSE(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    const es = FakeEventSource.last();
    unmount();

    expect(es.closed).toBe(true);
  });

  async function connected() {
    gqlFetch.mockResolvedValueOnce({ me: MOCK_AUTH_USER });
    const queryClient = createQueryClient();
    const clearSpy = vi.spyOn(queryClient, "clear");
    const hook = renderHook(() => useAuthSSE(), {
      wrapper: createQueryWrapper(queryClient),
    });
    await waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    return { ...hook, clearSpy };
  }

  it("ignores messages that are not valid JSON", async () => {
    const { clearSpy } = await connected();

    expect(() =>
      FakeEventSource.last().onmessage?.({ data: "not json" }),
    ).not.toThrow();
    expect(clearSpy).not.toHaveBeenCalled();
    expect(replaceLocation).not.toHaveBeenCalled();
  });

  it.each([null, "session_revoked", 42])(
    "ignores a non-object message (%j)",
    async (payload) => {
      const { clearSpy } = await connected();

      expect(() => FakeEventSource.last().emitMessage(payload)).not.toThrow();
      expect(clearSpy).not.toHaveBeenCalled();
      expect(replaceLocation).not.toHaveBeenCalled();
    },
  );

  it("reconnects after a drop with exponential backoff, then gives up after 4 retries", async () => {
    await connected();
    vi.useFakeTimers();

    for (const delay of [2_000, 4_000, 8_000, 16_000]) {
      const before = FakeEventSource.instances.length;
      const dropped = FakeEventSource.last();
      dropped.emitError();
      expect(dropped.closed).toBe(true);

      vi.advanceTimersByTime(delay - 1);
      expect(FakeEventSource.instances).toHaveLength(before);
      vi.advanceTimersByTime(1);
      expect(FakeEventSource.instances).toHaveLength(before + 1);
    }

    FakeEventSource.last().emitError();
    vi.advanceTimersByTime(60_000);
    expect(FakeEventSource.instances).toHaveLength(5);
  });

  it("resets the backoff once a reconnect succeeds", async () => {
    await connected();
    vi.useFakeTimers();

    FakeEventSource.last().emitError();
    vi.advanceTimersByTime(2_000);
    FakeEventSource.last().emitError();
    vi.advanceTimersByTime(4_000);
    FakeEventSource.last().emitOpen();

    FakeEventSource.last().emitError();
    vi.advanceTimersByTime(2_000);
    expect(FakeEventSource.instances).toHaveLength(4);
  });

  it("cancels a pending reconnect on unmount", async () => {
    const { unmount } = await connected();
    vi.useFakeTimers();

    FakeEventSource.last().emitError();
    unmount();
    vi.advanceTimersByTime(60_000);

    expect(FakeEventSource.instances).toHaveLength(1);
  });
});
