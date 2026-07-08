import type {
  InfiniteData,
  QueryClient,
  QueryKey,
} from "@tanstack/react-query";

export function patchFlatArray<T>(
  qc: QueryClient,
  key: QueryKey,
  item: T,
  getId: (t: T) => number,
): void {
  qc.setQueryData<T[]>(key, (old) =>
    old?.map((t) => (getId(t) === getId(item) ? item : t)),
  );
}

export function removeFromFlatArray<T>(
  qc: QueryClient,
  key: QueryKey,
  id: number,
  getId: (t: T) => number,
): void {
  qc.setQueryData<T[]>(key, (old) => old?.filter((t) => getId(t) !== id));
}

export function appendToFlatArray<T>(
  qc: QueryClient,
  key: QueryKey,
  item: T,
): void {
  qc.setQueryData<T[]>(key, (old) => [...(old ?? []), item]);
}

interface ConnectionLike<T> {
  items: T[];
  total: number;
}

export function patchConnection<T>(
  qc: QueryClient,
  keyPrefix: QueryKey,
  item: T,
  getId: (t: T) => number,
): void {
  qc.setQueriesData<InfiniteData<ConnectionLike<T>>>(
    { queryKey: keyPrefix },
    (old) =>
      old
        ? {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((t) =>
                getId(t) === getId(item) ? item : t,
              ),
            })),
          }
        : old,
  );
}

export function removeFromConnection<T>(
  qc: QueryClient,
  keyPrefix: QueryKey,
  id: number,
  getId: (t: T) => number,
): void {
  qc.setQueriesData<InfiniteData<ConnectionLike<T>>>(
    { queryKey: keyPrefix },
    (old) =>
      old
        ? {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.filter((t) => getId(t) !== id),
              total: page.total - 1,
            })),
          }
        : old,
  );
}

export function patchNestedField<TParent, TItem>(
  qc: QueryClient,
  parentKey: QueryKey,
  field: keyof TParent,
  item: TItem,
  getId: (t: TItem) => number,
  action: "add" | "upsert" | "remove",
): void {
  qc.setQueryData<TParent>(parentKey, (old) => {
    if (!old) return old;
    const current = old[field] as unknown as TItem[];
    let next: TItem[];
    if (action === "add") {
      next = [...current, item];
    } else if (action === "upsert") {
      next = current.map((t) => (getId(t) === getId(item) ? item : t));
    } else {
      next = current.filter((t) => getId(t) !== getId(item));
    }
    return { ...old, [field]: next };
  });
}
