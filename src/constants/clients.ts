import type { MessageDescriptor } from "react-intl";
import type {
  ClientType,
  ClientIndustry,
  ClientStatus,
  ClientSortField,
} from "@/types/clients.types";

export const EMPTY_CLIENT_FORM = {
  clientType: "COMPANY" as ClientType,
  name: "",
  legalName: "",
  vatNumber: "",
  legalForm: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  addressLine2: "",
  city: "",
  country: "",
  state: "",
  postalCode: "",
  color: "",
  notes: "",
  paymentDelayDays: "",
  taxRate: "",
  billingEndOfMonth: false,
  website: "",
  linkedinUrl: "",
  industry: null as ClientIndustry | null,
};

export const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  ACTIVE: "bg-primary/15 text-primary",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-destructive/15 text-destructive",
  ARCHIVED: "bg-muted text-muted-foreground",
  INVOICE_SENT: "bg-amber-100 text-amber-700",
  INVOICE_PAID: "bg-emerald-100 text-emerald-700",
};

export const EMPTY_CONTACT = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  jobTitle: "",
  color: "",
};

export const EMPTY_EDIT = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  jobTitle: "",
  color: "",
};

export const STATUS_LABEL_MESSAGES: Record<ClientStatus, MessageDescriptor> = {
  TO_CONTACT: { id: "clients.status.toContact", defaultMessage: "Prospect" },
  CONTACTED: { id: "clients.status.contacted", defaultMessage: "1st Contact" },
  FOLLOW_UP_1: {
    id: "clients.status.followUp1",
    defaultMessage: "Follow up 1",
  },
  FOLLOW_UP_2: {
    id: "clients.status.followUp2",
    defaultMessage: "Follow up 2",
  },
  FOLLOW_UP_3: {
    id: "clients.status.followUp3",
    defaultMessage: "Follow up 3",
  },
  RECONTACT_LATER: {
    id: "clients.status.recontactLater",
    defaultMessage: "Recontact Later",
  },
  TALKING: { id: "clients.status.talking", defaultMessage: "Talking" },
  CLIENT: { id: "clients.status.client", defaultMessage: "Client" },
  FORMER_CLIENT: {
    id: "clients.status.formerClient",
    defaultMessage: "Former client",
  },
};

export const STATUS_ORDER: ClientStatus[] = [
  // A past client to contact again: where a re-contact starts on the board.
  "FORMER_CLIENT",
  "TO_CONTACT",
  "CONTACTED",
  "FOLLOW_UP_1",
  "FOLLOW_UP_2",
  "FOLLOW_UP_3",
  "RECONTACT_LATER",
  "TALKING",
  "CLIENT",
];

// Board columns on the Prospect page — every status except the terminal CLIENT state.
export const PROSPECT_COLUMNS: ClientStatus[] = STATUS_ORDER.filter(
  (s) => s !== "CLIENT",
);

// Dropping a card into one of these columns means an active contact just happened.
export const ACTIVE_CONTACT_STATUSES = new Set<ClientStatus>([
  "CONTACTED",
  "FOLLOW_UP_1",
  "FOLLOW_UP_2",
  "FOLLOW_UP_3",
  "TALKING",
]);

export const INDUSTRY_LABEL_MESSAGES: Record<
  ClientIndustry,
  MessageDescriptor
> = {
  HEALTHCARE: {
    id: "clients.industry.healthcare",
    defaultMessage: "Healthcare",
  },
  EDUCATION: { id: "clients.industry.education", defaultMessage: "Education" },
  LEGAL: { id: "clients.industry.legal", defaultMessage: "Legal" },
  FINANCE: { id: "clients.industry.finance", defaultMessage: "Finance" },
  TECHNOLOGY: {
    id: "clients.industry.technology",
    defaultMessage: "Technology",
  },
  VIDEO_GAMES: {
    id: "clients.industry.videoGames",
    defaultMessage: "Video Games",
  },
  MARKETING: { id: "clients.industry.marketing", defaultMessage: "Marketing" },
  MEDIA_ENTERTAINMENT: {
    id: "clients.industry.mediaEntertainment",
    defaultMessage: "Media & Entertainment",
  },
  E_COMMERCE: {
    id: "clients.industry.eCommerce",
    defaultMessage: "E-Commerce",
  },
  MANUFACTURING: {
    id: "clients.industry.manufacturing",
    defaultMessage: "Manufacturing",
  },
  AUTOMOTIVE: {
    id: "clients.industry.automotive",
    defaultMessage: "Automotive",
  },
  GOVERNMENT: {
    id: "clients.industry.government",
    defaultMessage: "Government",
  },
  NGO: { id: "clients.industry.ngo", defaultMessage: "NGO / Non-profit" },
  REAL_ESTATE: {
    id: "clients.industry.realEstate",
    defaultMessage: "Real Estate",
  },
  TOURISM: { id: "clients.industry.tourism", defaultMessage: "Tourism" },
  LUXE: { id: "clients.industry.luxe", defaultMessage: "Luxury Goods" },
  TRANSLATION_AGENCY: {
    id: "clients.industry.translationAgency",
    defaultMessage: "Translation agency",
  },
  OTHER: { id: "clients.industry.other", defaultMessage: "Other" },
};

export const CLIENT_SORT_FIELD_LABELS: Record<
  ClientSortField,
  MessageDescriptor
> = {
  NAME: { id: "clients.sort.name", defaultMessage: "Company name" },
  LAST_NAME: { id: "clients.sort.lastName", defaultMessage: "Last name" },
  FIRST_NAME: { id: "clients.sort.firstName", defaultMessage: "First name" },
};

/** Sort fields per tab of the Clients page; the first is the default. */
export const COMPANY_SORT_FIELDS: readonly ClientSortField[] = ["NAME"];
export const PERSON_SORT_FIELDS: readonly ClientSortField[] = [
  "LAST_NAME",
  "FIRST_NAME",
];
