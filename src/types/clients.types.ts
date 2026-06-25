import type { TranslationRateType } from "@/graphql/rates.operations";
import type { Invoice } from "./invoices.types";
import type { ClientRate } from "./client-rates.types";

export type ClientType = "COMPANY" | "INDIVIDUAL";

export type ClientIndustry =
  | "HEALTHCARE"
  | "EDUCATION"
  | "LEGAL"
  | "FINANCE"
  | "TECHNOLOGY"
  | "VIDEO_GAMES"
  | "MARKETING"
  | "MEDIA_ENTERTAINMENT"
  | "E_COMMERCE"
  | "MANUFACTURING"
  | "AUTOMOTIVE"
  | "GOVERNMENT"
  | "NGO"
  | "REAL_ESTATE"
  | "OTHER";

export type ClientStatus =
  | "TO_CONTACT"
  | "CONTACTED"
  | "FOLLOW_UP_1"
  | "FOLLOW_UP_2"
  | "FOLLOW_UP_3"
  | "RECONTACT_LATER"
  | "TALKING"
  | "CLIENT";

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

export interface CompanyContact {
  id: number;
  clientId: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: number;
  userId: number;
  name: string;
  legalName: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  postalCode: string | null;
  vatNumber: string | null;
  notes: string | null;
  hubspotId: string | null;
  clientType: ClientType;
  firstName: string | null;
  lastName: string | null;
  paymentDelayDays: number | null;
  taxRate: number | null;
  billingEndOfMonth: boolean;
  website: string | null;
  industry: ClientIndustry | null;
  status: ClientStatus;
  contactedAt: string | null;
  tags: { id: number; name: string }[];
  contacts: CompanyContact[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientConnection {
  items: Client[];
  nextCursor: number | null;
  total: number;
}

export interface ClientHeaderProps {
  client: Client;
  onUpdate: (input: {
    id: number;
    name?: string;
    legalName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    vatNumber?: string;
    clientType?: ClientType;
    firstName?: string;
    lastName?: string;
    paymentDelayDays?: number;
    taxRate?: number;
    billingEndOfMonth?: boolean;
    website?: string;
    industry?: ClientIndustry | null;
    status?: ClientStatus;
    contactedAt?: string | null;
    tagIds?: number[];
  }) => Promise<unknown>;
  saving: boolean;
}

export type ActivityTabProps = {
  invoices: Invoice[];
  invoicesLoading: boolean;
  totalSeconds: number;
  timeLoading: boolean;
  hasProjects: boolean;
};

export type EditInput = {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

export type ContactInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

export type ContactsTabProps = {
  contacts: CompanyContact[];
  onDelete: (id: number) => void;
  onEdit: (input: EditInput) => Promise<unknown>;
  onAdd: (input: ContactInput) => Promise<unknown>;
  saving?: boolean;
  adding?: boolean;
};

export type NewClientFormProps = {
  onClose: () => void;
  defaultStatus?: ClientStatus;
  title?: string;
};

export type ClientHeaderFormState = {
  clientType: ClientType;
  name: string;
  legalName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  vatNumber: string;
  paymentDelayDays: string;
  taxRate: string;
  billingEndOfMonth: boolean;
  website: string;
  industry: ClientIndustry | null;
  status: ClientStatus;
  contactedAt: string;
  tagIds: number[];
};

export interface ClientCardProps {
  client: Client;
  onDelete: (id: number) => void;
}

export interface BillingFieldsProps {
  paymentDelayDays: string;
  taxRate: string;
  billingEndOfMonth: boolean;
  onChange: (
    field: "paymentDelayDays" | "taxRate" | "billingEndOfMonth",
    value: string | boolean,
  ) => void;
  idPrefix?: string;
}

export interface AddressFieldsProps {
  address: string;
  city: string;
  country: string;
  postalCode: string;
  onChange: (
    field: "address" | "city" | "country" | "postalCode",
    value: string,
  ) => void;
  idPrefix?: string;
}

export interface FormData {
  type: TranslationRateType;
  name: string;
  amount: string;
  currency: string;
  description: string;
}

export type ClientInput = {
  name: string;
  legalName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  vatNumber?: string;
  notes?: string;
  hubspotId?: string;
  clientType?: ClientType;
  firstName?: string;
  lastName?: string;
  paymentDelayDays?: number;
  taxRate?: number;
  billingEndOfMonth?: boolean;
  website?: string;
  industry?: ClientIndustry | null;
  status?: ClientStatus;
  contactedAt?: string | null;
  tagIds?: number[];
};

export type CreateClientRateInput = Omit<
  ClientRate,
  "id" | "clientId" | "userId" | "createdAt" | "updatedAt"
>;
