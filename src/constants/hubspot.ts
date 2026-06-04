export const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(
    "/graphql",
    "",
  ) ?? "http://localhost:3000";

export const HUBSPOT_AUTH_URL = `${(import.meta.env.VITE_API_URL as string | undefined)?.replace("/graphql", "") ?? "http://localhost:3000"}/hubspot/auth`;

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Español" },
  { value: "pt", label: "Português" },
  { value: "it", label: "Italiano" },
  { value: "nl", label: "Nederlands" },
  { value: "pl", label: "Polski" },
] as const;

export const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] as const;

export const HOUR_FORMATS = [
  { value: "24h", label: "24h (14:30)" },
  { value: "12h", label: "12h (2:30 PM)" },
] as const;

export const NUMBER_FORMATS = [
  { value: "1,234.56", label: "1,234.56" },
  { value: "1.234,56", label: "1.234,56" },
  { value: "1 234,56", label: "1 234,56" },
] as const;
