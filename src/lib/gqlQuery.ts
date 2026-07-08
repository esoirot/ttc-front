import type { TypedDocumentNode } from "@apollo/client/core";
import {
  useInfiniteQuery,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";
import { gqlFetch } from "@/lib/apollo";
import type { Connection } from "@/types/common.types";

export function useGqlQuery<
  TData,
  TVariables extends Record<string, unknown>,
  TResult = TData,
>(opts: {
  queryKey: readonly unknown[];
  query: TypedDocumentNode<TData, TVariables>;
  variables?: TVariables;
  select: (data: TData) => TResult;
  enabled?: boolean;
}): UseQueryResult<TResult, Error> {
  return useQuery({
    queryKey: opts.queryKey,
    queryFn: () =>
      gqlFetch<TData>(opts.query, opts.variables).then((d) => opts.select(d)),
    enabled: opts.enabled,
  });
}

export function useGqlConnectionQuery<
  TData,
  TVariables extends Record<string, unknown>,
  TItem,
>(opts: {
  queryKey: readonly unknown[];
  query: TypedDocumentNode<
    TData,
    TVariables & { pagination?: { limit: number; cursor?: number } }
  >;
  variables: TVariables;
  select: (data: TData) => Connection<TItem>;
  limit: number;
  enabled?: boolean;
}): {
  items: TItem[];
  total: number;
  hasMore: boolean;
  loadMore: () => void;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
} {
  const { data, fetchNextPage, hasNextPage, isLoading, error, refetch } =
    useInfiniteQuery({
      queryKey: opts.queryKey,
      queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
        gqlFetch<TData>(opts.query, {
          ...opts.variables,
          pagination: {
            limit: opts.limit,
            ...(pageParam != null ? { cursor: pageParam } : {}),
          },
        }).then((d) => opts.select(d)),
      initialPageParam: undefined as number | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      enabled: opts.enabled,
    });

  return {
    items: data?.pages.flatMap((p) => p?.items ?? []) ?? [],
    total: data?.pages[0]?.total ?? 0,
    hasMore: !!hasNextPage,
    loadMore: () => void fetchNextPage(),
    loading: isLoading,
    error,
    refetch,
  };
}
