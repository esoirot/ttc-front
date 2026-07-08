export const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(
    "/graphql",
    "",
  ) ?? "http://localhost:3000";

export const GOOGLE_CALENDAR_AUTH_URL = `${API_BASE}/google-calendar/auth`;
