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

import { useAuthSSE } from "./useAuthSSE";

describe("useAuthSSE", () => {
  const replaceSpy = vi.fn();
  const originalLocation = window.location;

  beforeEach(() => {
    gqlFetch.mockReset();
    FakeEventSource.reset();
    vi.stubGlobal("EventSource", FakeEventSource);
    replaceSpy.mockReset();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, replace: replaceSpy },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
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
    expect(replaceSpy).toHaveBeenCalledWith("/login");
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
    expect(replaceSpy).not.toHaveBeenCalled();
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
});
