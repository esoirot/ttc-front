import { useEffect } from "react";
import { useApolloClient } from "@apollo/client/react";
import { useCurrentUser } from "./useAuth";

const BASE_URL = (import.meta.env.VITE_API_URL as string).replace(
  "/graphql",
  "",
);

const MAX_RETRIES = 4;
const RETRY_BASE_MS = 2_000;

export function useAuthSSE() {
  const { user } = useCurrentUser();
  const client = useApolloClient();

  useEffect(() => {
    if (!user?.id) return;

    let retries = 0;
    let es: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      es = new EventSource(`${BASE_URL}/auth/events`, {
        withCredentials: true,
      });

      es.onmessage = (event) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(event.data as string);
        } catch {
          return;
        }
        if (parsed !== null && typeof parsed === "object" && "type" in parsed) {
          const { type } = parsed as { type: string };
          if (type === "session_revoked") {
            void client.clearStore().then(() => {
              window.location.replace("/login");
            });
          }
          // All other typed messages (including "connected") are control frames — skip.
        }
      };

      es.onerror = () => {
        es?.close();
        es = null;
        if (retries >= MAX_RETRIES) return;
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
  }, [user?.id, client]);
}
