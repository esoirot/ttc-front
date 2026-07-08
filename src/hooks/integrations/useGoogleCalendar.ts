import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPost } from "../../lib/api";
import type {
  GoogleCalendarStatus,
  GoogleCalendarEventList,
  CreateGoogleCalendarEventInput,
  GoogleCalendarEvent,
} from "@/types/google-calendar.types";

export function useGoogleCalendarStatus() {
  return useQuery<GoogleCalendarStatus>({
    queryKey: ["google-calendar", "status"],
    queryFn: () => apiGet<GoogleCalendarStatus>("/google-calendar/status"),
    retry: false,
  });
}

export function useDisconnectGoogleCalendar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiDelete("/google-calendar/disconnect"),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: ["google-calendar"] }),
  });
}

export function useGoogleCalendarEvents(
  timeMin: string,
  timeMax: string,
  enabled = true,
) {
  return useQuery<GoogleCalendarEventList>({
    queryKey: ["google-calendar", "events", timeMin, timeMax],
    queryFn: () => {
      const params = new URLSearchParams({ timeMin, timeMax });
      return apiGet<GoogleCalendarEventList>(
        `/google-calendar/events?${params.toString()}`,
      );
    },
    enabled: enabled && !!timeMin && !!timeMax,
    retry: false,
  });
}

export function useCreateGoogleCalendarEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGoogleCalendarEventInput) =>
      apiPost<GoogleCalendarEvent>("/google-calendar/events", input),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: ["google-calendar", "events"] }),
  });
}
