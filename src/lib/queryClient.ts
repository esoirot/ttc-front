import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "./api";
import { currentPathname, isPublicPath, replaceLocation } from "./navigation";

export function createAppQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (error instanceof ApiError && error.status === 401) {
          const key = query.queryKey[0];
          const isPublic = isPublicPath(currentPathname());
          if (key !== "me" && !isPublic) replaceLocation("/login");
        }
      },
    }),
    // Many call sites fire mutations without awaiting them; surface every
    // failure here so a rejected save never looks like it succeeded. Hooks
    // whose forms render the error themselves opt out via meta.inlineError.
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation.meta?.inlineError) return;
        toast.error(error.message);
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => {
          if (
            error instanceof ApiError &&
            (error.status === 401 || error.status === 403)
          )
            return false;
          return failureCount < 2;
        },
      },
    },
  });
}
