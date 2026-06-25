import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { createQueryClient } from "@/test/queryClientWrapper";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { useInvoicesPage } from "./useInvoicesPage";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

function emptyConnection() {
  return { items: [], nextCursor: null, total: 0 };
}

function blanketResponse(overrides: Record<string, unknown> = {}) {
  return Promise.resolve({
    invoices: emptyConnection(),
    clients: emptyConnection(),
    projects: emptyConnection(),
    ...overrides,
  });
}

describe("useInvoicesPage", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    gqlFetch.mockImplementation(() => blanketResponse());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("builds a clientId -> name lookup map from the clients list", async () => {
    gqlFetch.mockImplementation(() =>
      blanketResponse({
        clients: {
          items: [{ id: 1, name: "Acme" }],
          nextCursor: null,
          total: 1,
        },
      }),
    );

    const { result } = renderHook(() => useInvoicesPage(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.clientMap).toEqual({ 1: "Acme" });
  });

  it("toggleCreate and toggleGenerate are mutually exclusive", async () => {
    const { result } = renderHook(() => useInvoicesPage(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.toggleCreate();
    });
    expect(result.current.showCreate).toBe(true);
    expect(result.current.showGenerate).toBe(false);

    act(() => {
      result.current.toggleGenerate();
    });
    expect(result.current.showGenerate).toBe(true);
    expect(result.current.showCreate).toBe(false);
  });

  it("debounces search input before passing it to useInvoices", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { result } = renderHook(() => useInvoicesPage(), { wrapper });

    act(() => {
      result.current.setSearch("acme");
    });

    expect(
      gqlFetch.mock.calls.some(
        (c) => (c[1] as Record<string, unknown>)?.search === "acme",
      ),
    ).toBe(false);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    await waitFor(() =>
      expect(
        gqlFetch.mock.calls.some(
          (c) => (c[1] as Record<string, unknown>)?.search === "acme",
        ),
      ).toBe(true),
    );
  });

  it("setTab passes through to the invoices query as status, except ALL", async () => {
    const { result } = renderHook(() => useInvoicesPage(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setTab("SENT");
    });

    await waitFor(() =>
      expect(
        gqlFetch.mock.calls.some(
          (c) => (c[1] as Record<string, unknown>)?.status === "SENT",
        ),
      ).toBe(true),
    );
  });
});
