import type {
  ClientType,
  ClientIndustry,
  ClientStatus,
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

export const STATUS_LABELS: Record<ClientStatus, string> = {
  TO_CONTACT: "Prospect",
  CONTACTED: "1st Contact",
  FOLLOW_UP_1: "Follow up 1",
  FOLLOW_UP_2: "Follow up 2",
  FOLLOW_UP_3: "Follow up 3",
  RECONTACT_LATER: "Recontact Later",
  TALKING: "Talking",
  CLIENT: "Client",
};

export const STATUS_ORDER: ClientStatus[] = [
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

export const INDUSTRY_LABELS: Record<ClientIndustry, string> = {
  HEALTHCARE: "Healthcare",
  EDUCATION: "Education",
  LEGAL: "Legal",
  FINANCE: "Finance",
  TECHNOLOGY: "Technology",
  VIDEO_GAMES: "Video Games",
  MARKETING: "Marketing",
  MEDIA_ENTERTAINMENT: "Media & Entertainment",
  E_COMMERCE: "E-Commerce",
  MANUFACTURING: "Manufacturing",
  AUTOMOTIVE: "Automotive",
  GOVERNMENT: "Government",
  NGO: "NGO / Non-profit",
  REAL_ESTATE: "Real Estate",
  OTHER: "Other",
};
