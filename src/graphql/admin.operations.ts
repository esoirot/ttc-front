import { gql } from "@apollo/client/core";
import type { TypedDocumentNode } from "@apollo/client/core";
import type { Client } from "./clients.operations";
import type { Project, ProjectStatus } from "./projects.operations";
import type { Invoice, InvoiceStatus } from "./invoices.operations";
import type { TimeEntry } from "./time-entries.operations";
import type { Rate, RateType } from "./rates.operations";

export type AdminPermission =
  | "MANAGE_USERS"
  | "MANAGE_CLIENTS"
  | "MANAGE_PROJECTS"
  | "MANAGE_INVOICES"
  | "MANAGE_TIME"
  | "MANAGE_RATES";

export interface AdminOwner {
  id: number;
  email: string;
  name: string | null;
}

export interface AdminStats {
  totalUsers: number;
  totalClients: number;
  totalProjects: number;
  totalInvoices: number;
  totalRevenue: number;
  totalTimeSeconds: number;
}

export interface AdminClient extends Client {
  owner: AdminOwner;
}

export interface AdminProject extends Project {
  owner: AdminOwner;
}

export interface AdminInvoice extends Invoice {
  owner: AdminOwner;
}

export interface AdminTimeEntry extends TimeEntry {
  owner: AdminOwner;
}

export interface AdminRate extends Rate {
  owner: AdminOwner;
}

export interface AdminConnection<T> {
  items: T[];
  nextCursor: number | null;
  total: number;
}

// ── Stats ────────────────────────────────────────────────────────────────────

export const ADMIN_STATS_QUERY: TypedDocumentNode<
  { adminStats: AdminStats },
  Record<string, never>
> = gql`
  query AdminStats {
    adminStats {
      totalUsers
      totalClients
      totalProjects
      totalInvoices
      totalRevenue
      totalTimeSeconds
    }
  }
`;

// ── Clients ──────────────────────────────────────────────────────────────────

const ADMIN_OWNER_FIELDS = `owner { id email name }`;

const ADMIN_CLIENT_FIELDS = `
  id userId name legalName email phone address city country postalCode
  vatNumber hubspotId createdAt updatedAt contacts { id firstName lastName email }
  ${ADMIN_OWNER_FIELDS}
`;

export const ADMIN_CLIENTS_QUERY: TypedDocumentNode<
  { adminClients: AdminConnection<AdminClient> },
  { pagination?: { limit?: number; cursor?: number }; search?: string }
> = gql`
  query AdminClients($pagination: PaginationInput, $search: String) {
    adminClients(pagination: $pagination, search: $search) {
      items { ${ADMIN_CLIENT_FIELDS} }
      nextCursor
      total
    }
  }
`;

export const ADMIN_CREATE_CLIENT_MUTATION: TypedDocumentNode<
  { adminCreateClient: AdminClient },
  {
    input: {
      userId: number;
      name: string;
      email?: string;
      phone?: string;
      city?: string;
      country?: string;
    };
  }
> = gql`
  mutation AdminCreateClient($input: AdminCreateClientInput!) {
    adminCreateClient(input: $input) { ${ADMIN_CLIENT_FIELDS} }
  }
`;

export const ADMIN_UPDATE_CLIENT_MUTATION: TypedDocumentNode<
  { adminUpdateClient: AdminClient },
  {
    input: {
      id: number;
      name?: string;
      email?: string;
      phone?: string;
      legalName?: string;
      city?: string;
      country?: string;
      postalCode?: string;
      vatNumber?: string;
      address?: string;
    };
  }
> = gql`
  mutation AdminUpdateClient($input: AdminUpdateClientInput!) {
    adminUpdateClient(input: $input) { ${ADMIN_CLIENT_FIELDS} }
  }
`;

export const ADMIN_DELETE_CLIENT_MUTATION: TypedDocumentNode<
  { adminDeleteClient: { id: number } },
  { id: number }
> = gql`
  mutation AdminDeleteClient($id: Int!) {
    adminDeleteClient(id: $id) {
      id
    }
  }
`;

// ── Projects ─────────────────────────────────────────────────────────────────

const ADMIN_PROJECT_FIELDS = `
  id userId clientId title description status sourceLanguage targetLanguage
  wordCount unitPrice currency deadline startDate createdAt updatedAt
  ${ADMIN_OWNER_FIELDS}
`;

export const ADMIN_PROJECTS_QUERY: TypedDocumentNode<
  { adminProjects: AdminConnection<AdminProject> },
  {
    pagination?: { limit?: number; cursor?: number };
    search?: string;
    status?: ProjectStatus;
  }
> = gql`
  query AdminProjects($pagination: PaginationInput, $search: String, $status: ProjectStatus) {
    adminProjects(pagination: $pagination, search: $search, status: $status) {
      items { ${ADMIN_PROJECT_FIELDS} }
      nextCursor
      total
    }
  }
`;

export const ADMIN_CREATE_PROJECT_MUTATION: TypedDocumentNode<
  { adminCreateProject: AdminProject },
  {
    input: {
      userId: number;
      title: string;
      status?: ProjectStatus;
      clientId?: number;
      currency?: string;
    };
  }
> = gql`
  mutation AdminCreateProject($input: AdminCreateProjectInput!) {
    adminCreateProject(input: $input) { ${ADMIN_PROJECT_FIELDS} }
  }
`;

export const ADMIN_UPDATE_PROJECT_MUTATION: TypedDocumentNode<
  { adminUpdateProject: AdminProject },
  {
    input: {
      id: number;
      title?: string;
      status?: ProjectStatus;
      description?: string;
      wordCount?: number;
      unitPrice?: number;
      deadline?: string;
    };
  }
> = gql`
  mutation AdminUpdateProject($input: AdminUpdateProjectInput!) {
    adminUpdateProject(input: $input) { ${ADMIN_PROJECT_FIELDS} }
  }
`;

export const ADMIN_DELETE_PROJECT_MUTATION: TypedDocumentNode<
  { adminDeleteProject: { id: number } },
  { id: number }
> = gql`
  mutation AdminDeleteProject($id: Int!) {
    adminDeleteProject(id: $id) {
      id
    }
  }
`;

// ── Invoices ─────────────────────────────────────────────────────────────────

const ADMIN_INVOICE_FIELDS = `
  id userId clientId number status currency issuedAt dueDate paidAt notes createdAt updatedAt
  items { id description quantity unitPrice total }
  ${ADMIN_OWNER_FIELDS}
`;

export const ADMIN_INVOICES_QUERY: TypedDocumentNode<
  { adminInvoices: AdminConnection<AdminInvoice> },
  {
    pagination?: { limit?: number; cursor?: number };
    search?: string;
    status?: InvoiceStatus;
  }
> = gql`
  query AdminInvoices($pagination: PaginationInput, $search: String, $status: InvoiceStatus) {
    adminInvoices(pagination: $pagination, search: $search, status: $status) {
      items { ${ADMIN_INVOICE_FIELDS} }
      nextCursor
      total
    }
  }
`;

export const ADMIN_UPDATE_INVOICE_MUTATION: TypedDocumentNode<
  { adminUpdateInvoice: AdminInvoice },
  {
    input: {
      id: number;
      status?: InvoiceStatus;
      notes?: string;
      dueDate?: string;
    };
  }
> = gql`
  mutation AdminUpdateInvoice($input: AdminUpdateInvoiceInput!) {
    adminUpdateInvoice(input: $input) { ${ADMIN_INVOICE_FIELDS} }
  }
`;

export const ADMIN_DELETE_INVOICE_MUTATION: TypedDocumentNode<
  { adminDeleteInvoice: { id: number } },
  { id: number }
> = gql`
  mutation AdminDeleteInvoice($id: Int!) {
    adminDeleteInvoice(id: $id) {
      id
    }
  }
`;

// ── Time Entries ─────────────────────────────────────────────────────────────

const ADMIN_TIME_ENTRY_FIELDS = `
  id userId projectId description startTime endTime durationSeconds billable createdAt updatedAt
  ${ADMIN_OWNER_FIELDS}
`;

export const ADMIN_TIME_ENTRIES_QUERY: TypedDocumentNode<
  { adminTimeEntries: AdminConnection<AdminTimeEntry> },
  { pagination?: { limit?: number; cursor?: number }; userId?: number }
> = gql`
  query AdminTimeEntries($pagination: PaginationInput, $userId: Int) {
    adminTimeEntries(pagination: $pagination, userId: $userId) {
      items { ${ADMIN_TIME_ENTRY_FIELDS} }
      nextCursor
      total
    }
  }
`;

export const ADMIN_DELETE_TIME_ENTRY_MUTATION: TypedDocumentNode<
  { adminDeleteTimeEntry: { id: number } },
  { id: number }
> = gql`
  mutation AdminDeleteTimeEntry($id: Int!) {
    adminDeleteTimeEntry(id: $id) {
      id
    }
  }
`;

// ── Rates ────────────────────────────────────────────────────────────────────

const ADMIN_RATE_FIELDS = `
  id userId type name amount currency description createdAt updatedAt
  ${ADMIN_OWNER_FIELDS}
`;

export const ADMIN_RATES_QUERY: TypedDocumentNode<
  { adminRates: AdminConnection<AdminRate> },
  { type?: RateType }
> = gql`
  query AdminRates($type: RateType) {
    adminRates(type: $type) {
      items { ${ADMIN_RATE_FIELDS} }
      nextCursor
      total
    }
  }
`;

export const ADMIN_CREATE_RATE_MUTATION: TypedDocumentNode<
  { adminCreateRate: AdminRate },
  {
    input: {
      userId: number;
      type: RateType;
      name: string;
      amount: number;
      currency: string;
      description?: string;
    };
  }
> = gql`
  mutation AdminCreateRate($input: AdminCreateRateInput!) {
    adminCreateRate(input: $input) { ${ADMIN_RATE_FIELDS} }
  }
`;

export const ADMIN_UPDATE_RATE_MUTATION: TypedDocumentNode<
  { adminUpdateRate: AdminRate },
  {
    input: {
      id: number;
      name?: string;
      amount?: number;
      currency?: string;
      description?: string;
    };
  }
> = gql`
  mutation AdminUpdateRate($input: AdminUpdateRateInput!) {
    adminUpdateRate(input: $input) { ${ADMIN_RATE_FIELDS} }
  }
`;

export const ADMIN_DELETE_RATE_MUTATION: TypedDocumentNode<
  { adminDeleteRate: { id: number } },
  { id: number }
> = gql`
  mutation AdminDeleteRate($id: Int!) {
    adminDeleteRate(id: $id) {
      id
    }
  }
`;
