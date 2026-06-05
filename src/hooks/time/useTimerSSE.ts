import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { TimeEntry } from "@/types/time-entries.types";
import { useCurrentUser } from "../auth/useAuth";

const BASE_URL = (import.meta.env.VITE_API_URL as string).replace(
  "/graphql",
  "",
);

const MAX_RETRIES = 4;
const RETRY_BASE_MS = 2_000;

export function useTimerSSE() {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    let retries = 0;
    let es: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      es = new EventSource(`${BASE_URL}/timer/events`, {
        withCredentials: true,
      });

      es.onmessage = (event) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(event.data as string);
        } catch {
          return;
        }
        // Skip control messages (e.g. { type: "connected" }) — not timer payloads.
        if (parsed !== null && typeof parsed === "object" && "type" in parsed) {
          return;
        }
        queryClient.setQueryData(["activeTimer"], parsed as TimeEntry | null);
      };

      es.onerror = () => {
        es?.close();
        es = null;
        if (retries >= MAX_RETRIES) return;
        // Exponential backoff: 2s, 4s, 8s, 16s.
        const delay = RETRY_BASE_MS * Math.pow(2, retries);
        retries++;
        retryTimer = setTimeout(connect, delay);
      };

      es.onopen = () => {
        retries = 0;
      };
    };

    connect();

    return () => {
      clearTimeout(retryTimer);
      es?.close();
    };
  }, [user?.id, queryClient]);
}
