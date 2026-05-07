import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPatch, apiPost } from "../lib/api";

export type ClockifyWorkspace = {
  id: string;
  name: string;
  imageUrl: string;
};

export type ClockifyProject = {
  id: string;
  name: string;
  color: string;
  archived: boolean;
  clientId: string | null;
};

export type ClockifyTimeInterval = {
  start: string;
  end: string | null;
  duration: string | null;
};

export type ClockifyTimeEntry = {
  id: string;
  description: string | null;
  projectId: string | null;
  tagIds: string[];
  timeInterval: ClockifyTimeInterval;
  workspaceId: string;
  billable: boolean;
};

export type ClockifyStatus = {
  connected: boolean;
  workspaceId: string | null;
};

export type StartEntryInput = {
  description?: string;
  projectId?: string;
  tagIds?: string[];
  start?: string;
  billable?: boolean;
};

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
    refetchInterval: 10_000,
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
    mutationFn: (entryId: string) =>
      apiPatch<ClockifyTimeEntry>(
        `/clockify/workspaces/${workspaceId}/entries/${entryId}/stop`,
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
