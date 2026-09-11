import type { MessageDescriptor } from "react-intl";
import type { ActivityType } from "@/types/activities.types";

export const ACTIVITY_TYPE_LABEL_MESSAGES: Record<
  ActivityType,
  MessageDescriptor
> = {
  TRANSLATOR: {
    id: "activities.type.translator",
    defaultMessage: "Translator",
  },
  CORRECTOR: { id: "activities.type.corrector", defaultMessage: "Corrector" },
  CUSTOM: { id: "activities.type.custom", defaultMessage: "Custom" },
};

export const LEGAL_FORMS = [
  "EI",
  "EIRL",
  "EURL",
  "SARL",
  "SAS",
  "SASU",
  "SA",
  "SNC",
  "SCS",
  "SCA",
  "Micro-entrepreneur",
] as const;

export const TIMEZONES: { value: string; label: string }[] = [
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
  { value: "Europe/Madrid", label: "Madrid (CET/CEST)" },
  { value: "Europe/Rome", label: "Rome (CET/CEST)" },
  { value: "Europe/Amsterdam", label: "Amsterdam (CET/CEST)" },
  { value: "Europe/Brussels", label: "Brussels (CET/CEST)" },
  { value: "Europe/Zurich", label: "Zurich (CET/CEST)" },
  { value: "Europe/Warsaw", label: "Warsaw (CET/CEST)" },
  { value: "Europe/Stockholm", label: "Stockholm (CET/CEST)" },
  { value: "America/New_York", label: "New York (EST/EDT)" },
  { value: "America/Chicago", label: "Chicago (CST/CDT)" },
  { value: "America/Denver", label: "Denver (MST/MDT)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST/PDT)" },
  { value: "America/Toronto", label: "Toronto (EST/EDT)" },
  { value: "America/Sao_Paulo", label: "São Paulo (BRT)" },
  { value: "America/Buenos_Aires", label: "Buenos Aires (ART)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Kolkata", label: "Kolkata (IST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
  { value: "Pacific/Auckland", label: "Auckland (NZST/NZDT)" },
  { value: "Africa/Casablanca", label: "Casablanca (WET)" },
  { value: "Africa/Cairo", label: "Cairo (EET)" },
];
