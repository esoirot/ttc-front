import { gql } from "@apollo/client/core";
import type { TypedDocumentNode } from "@apollo/client/core";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/test/queryClientWrapper";

const { gqlFetch } = vi.hoisted(() => ({ gqlFetch: vi.fn() }));
vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate: vi.fn() }));

import { useGqlConnectionQuery, useGqlQuery } from "./gqlQuery";

interface Widget {
  id: number;
  name: string;
}

interface WidgetConnection {
  items: Widget[];
  nextCursor: number | null;
  total: number;
}

const WIDGET_QUERY: TypedDocumentNode<{ widget: Widget }, { id: number }> = gql`
  query Widget($id: Int!) {
    widget(id: $id) {
      id
      name
    }
  }
`;

const WIDGETS_QUERY: TypedDocumentNode<
  { widgets: WidgetConnection },
  { pagination?: { limit: number; cursor?: number } }
> = gql`
  query Widgets($pagination: PaginationInput) {
    widgets(pagination: $pagination) {
      items {
        id
        name
      }
      nextCursor
      total
    }
  }
`;

describe("useGqlQuery", () => {
  beforeEach(() => gqlFetch.mockReset());

  it("returns data transformed by select once the query resolves", async () => {
    gqlFetch.mockResolvedValueOnce({ widget: { id: 1, name: "Sprocket" } });

    const { result } = renderHook(
      () =>
        useGqlQuery({
          queryKey: ["widget", 1],
          query: WIDGET_QUERY,
          variables: { id: 1 },
          select: (d) => d.widget,
        }),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({ id: 1, name: "Sprocket" });
    expect(gqlFetch).toHaveBeenCalledWith(WIDGET_QUERY, { id: 1 });
  });

  it("does not fetch while enabled is false", () => {
    renderHook(
      () =>
        useGqlQuery({
          queryKey: ["widget", 1],
          query: WIDGET_QUERY,
          variables: { id: 1 },
          select: (d) => d.widget,
          enabled: false,
        }),
      { wrapper: createQueryWrapper() },
    );

    expect(gqlFetch).not.toHaveBeenCalled();
  });
});

describe("useGqlConnectionQuery", () => {
  beforeEach(() => gqlFetch.mockReset());

  it("flattens items across pages and reports total from the first page", async () => {
    gqlFetch.mockResolvedValueOnce({
      widgets: { items: [{ id: 1, name: "A" }], nextCursor: null, total: 1 },
    });

    const { result } = renderHook(
      () =>
        useGqlConnectionQuery({
          queryKey: ["widgets"],
          query: WIDGETS_QUERY,
          variables: {},
          select: (d) => d.widgets,
          limit: 20,
        }),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([{ id: 1, name: "A" }]);
    expect(result.current.total).toBe(1);
    expect(result.current.hasMore).toBe(false);
  });

  it("exposes a refetch function that re-fetches the first page", async () => {
    gqlFetch.mockResolvedValueOnce({
      widgets: { items: [{ id: 1, name: "A" }], nextCursor: null, total: 1 },
    });

    const { result } = renderHook(
      () =>
        useGqlConnectionQuery({
          queryKey: ["widgets", "refetch"],
          query: WIDGETS_QUERY,
          variables: {},
          select: (d) => d.widgets,
          limit: 20,
        }),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    gqlFetch.mockResolvedValueOnce({
      widgets: {
        items: [{ id: 1, name: "A-updated" }],
        nextCursor: null,
        total: 1,
      },
    });

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() =>
      expect(result.current.items).toEqual([{ id: 1, name: "A-updated" }]),
    );
  });

  it("guards against a null/undefined page when flattening items", async () => {
    gqlFetch.mockResolvedValueOnce({
      widgets: {
        items: undefined as unknown as Widget[],
        nextCursor: null,
        total: 0,
      },
    });

    const { result } = renderHook(
      () =>
        useGqlConnectionQuery({
          queryKey: ["widgets", "empty"],
          query: WIDGETS_QUERY,
          variables: {},
          select: (d) => d.widgets,
          limit: 20,
        }),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([]);
  });

  it("requests the next cursor page when loadMore is called", async () => {
    gqlFetch
      .mockResolvedValueOnce({
        widgets: { items: [{ id: 1, name: "A" }], nextCursor: 2, total: 2 },
      })
      .mockResolvedValueOnce({
        widgets: { items: [{ id: 2, name: "B" }], nextCursor: null, total: 2 },
      });

    const { result } = renderHook(
      () =>
        useGqlConnectionQuery({
          queryKey: ["widgets", "paged"],
          query: WIDGETS_QUERY,
          variables: {},
          select: (d) => d.widgets,
          limit: 1,
        }),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasMore).toBe(true);

    act(() => result.current.loadMore());

    await waitFor(() => expect(result.current.items).toHaveLength(2));
    expect(gqlFetch).toHaveBeenLastCalledWith(WIDGETS_QUERY, {
      pagination: { limit: 1, cursor: 2 },
    });
    expect(result.current.hasMore).toBe(false);
  });
});
