import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPatch, apiPost, ApiError } from "../../lib/api";
import type {
  ClockifyWorkspace,
  ClockifyProject,
  ClockifyTag,
  ClockifyStatus,
  StartEntryInput,
  UpdateEntryInput,
  ClockifyTimeEntry,
} from "@/types/clockify.types";

export function useClockifyStatus() {
  return useQuery<ClockifyStatus>({
    queryKey: ["clockify", "status"],
    queryFn: () => apiGet<ClockifyStatus>("/clockify/status"),
    retry: false,
  });
}

export function useSetClockifyCredentials() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { apiKey: string; workspaceId?: string }) =>
      apiPost<void>("/clockify/credentials", input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["clockify"] });
    },
  });
}

export function useDisconnectClockify() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiDelete("/clockify/credentials"),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["clockify"] });
    },
  });
}

export function useSetClockifyWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (workspaceId: string) =>
      apiPatch<void>("/clockify/workspace", { workspaceId }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["clockify", "status"] });
    },
  });
}

export function useClockifyWorkspaces(enabled = true) {
  return useQuery<ClockifyWorkspace[]>({
    queryKey: ["clockify", "workspaces"],
    queryFn: () => apiGet<ClockifyWorkspace[]>("/clockify/workspaces"),
    enabled,
    retry: false,
  });
}

export function useClockifyProjects(workspaceId: string | null) {
  return useQuery<ClockifyProject[]>({
    queryKey: ["clockify", "projects", workspaceId],
    queryFn: () =>
      apiGet<ClockifyProject[]>(`/clockify/workspaces/${workspaceId}/projects`),
    enabled: !!workspaceId,
    retry: false,
  });
}

export function useClockifyEntries(
  workspaceId: string | null,
  start?: string,
  end?: string,
) {
  const params = new URLSearchParams();
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  const qs = params.size > 0 ? `?${params.toString()}` : "";
  return useQuery<ClockifyTimeEntry[]>({
    queryKey: ["clockify", "entries", workspaceId, start, end],
    queryFn: () =>
      apiGet<ClockifyTimeEntry[]>(
        `/clockify/workspaces/${workspaceId}/entries${qs}`,
      ),
    enabled: !!workspaceId,
    retry: false,
  });
}

export function useClockifyActiveEntry(workspaceId: string | null) {
  return useQuery<ClockifyTimeEntry | null>({
    queryKey: ["clockify", "active", workspaceId],
    queryFn: () =>
      apiGet<ClockifyTimeEntry | null>(
        `/clockify/workspaces/${workspaceId}/entries/active`,
      ),
    enabled: !!workspaceId,
    refetchInterval: (query) => {
      if (query.state.status !== "error") return 10_000;
      const err = query.state.error;
      return err instanceof ApiError && err.status === 401 ? false : 10_000;
    },
    retry: false,
  });
}

export function useStartEntry(workspaceId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StartEntryInput) =>
      apiPost<ClockifyTimeEntry>(
        `/clockify/workspaces/${workspaceId}/entries`,
        input,
      ),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: ["clockify", "active", workspaceId],
      });
      void qc.invalidateQueries({
        queryKey: ["clockify", "entries", workspaceId],
      });
    },
  });
}

export function useStopEntry(workspaceId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiPatch<ClockifyTimeEntry>(
        `/clockify/workspaces/${workspaceId}/entries/stop`,
      ),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: ["clockify", "active", workspaceId],
      });
      void qc.invalidateQueries({
        queryKey: ["clockify", "entries", workspaceId],
      });
    },
  });
}

export function useDeleteEntry(workspaceId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) =>
      apiDelete(`/clockify/workspaces/${workspaceId}/entries/${entryId}`),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: ["clockify", "entries", workspaceId],
      });
    },
  });
}

export function useClockifyTags(workspaceId: string | null) {
  return useQuery<ClockifyTag[]>({
    queryKey: ["clockify", "tags", workspaceId],
    queryFn: () =>
      apiGet<ClockifyTag[]>(`/clockify/workspaces/${workspaceId}/tags`),
    enabled: !!workspaceId,
    retry: false,
  });
}

export function useCreateTag(workspaceId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      apiPost<ClockifyTag>(`/clockify/workspaces/${workspaceId}/tags`, {
        name,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: ["clockify", "tags", workspaceId],
      });
    },
  });
}

export function useUpdateEntry(workspaceId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, ...body }: UpdateEntryInput) =>
      apiPatch<ClockifyTimeEntry>(
        `/clockify/workspaces/${workspaceId}/entries/${entryId}`,
        body,
      ),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: ["clockify", "entries", workspaceId],
      });
    },
  });
}

export function useImportClockifyEntries(workspaceId: string | null) {
  return useMutation({
    mutationFn: (range: { start: string; end: string }) =>
      apiPost<{ imported: number; skipped: number }>(
        `/clockify/workspaces/${workspaceId}/entries/import`,
        range,
      ),
  });
}
