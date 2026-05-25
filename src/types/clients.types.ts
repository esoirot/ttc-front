import type { Invoice } from "./invoices.types";

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

export type NewClientFormProps = { onClose: () => void };
