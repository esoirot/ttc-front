import type { Invoice } from "./invoices.types";
import type { ClientRate } from "./client-rates.types";
import type { Connection } from "./common.types";

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

export interface CompanyContact {
  id: number;
  clientId: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  color: string | null;
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
  addressLine2: string | null;
  city: string | null;
  country: string | null;
  state: string | null;
  postalCode: string | null;
  vatNumber: string | null;
  legalForm: string | null;
  color: string | null;
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

export type ClientConnection = Connection<Client>;

export interface ClientHeaderProps {
  client: Client;
  onUpdate: (input: {
    id: number;
    name?: string;
    legalName?: string;
    email?: string;
    phone?: string;
    address?: string;
    addressLine2?: string;
    city?: string;
    country?: string;
    state?: string;
    postalCode?: string;
    vatNumber?: string;
    legalForm?: string;
    color?: string;
    notes?: string;
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
  jobTitle?: string;
  color?: string;
};

export type ContactInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  color?: string;
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
  addressLine2: string;
  city: string;
  country: string;
  state: string;
  postalCode: string;
  vatNumber: string;
  legalForm: string;
  color: string;
  notes: string;
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
  addressLine2: string;
  city: string;
  country: string;
  state: string;
  postalCode: string;
  onChange: (
    field:
      | "address"
      | "addressLine2"
      | "city"
      | "country"
      | "state"
      | "postalCode",
    value: string,
  ) => void;
  idPrefix?: string;
}

export type ClientInput = {
  name: string;
  legalName?: string;
  email?: string;
  phone?: string;
  address?: string;
  addressLine2?: string;
  city?: string;
  country?: string;
  state?: string;
  postalCode?: string;
  vatNumber?: string;
  legalForm?: string;
  color?: string;
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
