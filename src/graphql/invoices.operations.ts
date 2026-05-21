import { gql } from "@apollo/client/core";
import type { TypedDocumentNode } from "@apollo/client/core";

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

export interface InvoiceItem {
  id: number;
  invoiceId: number;
  projectId: number | null;
  timeEntryId: number | null;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: number;
  userId: number;
  clientId: number | null;
  number: string;
  status: InvoiceStatus;
  currency: string;
  issuedAt: string | null;
  dueDate: string | null;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: InvoiceItem[];
}

export interface InvoiceConnection {
  items: Invoice[];
  nextCursor: number | null;
  total: number;
}

const ITEM_FIELDS = `id invoiceId projectId timeEntryId description quantity unitPrice total`;
const INV_FIELDS = `id userId clientId number status currency issuedAt dueDate paidAt notes createdAt updatedAt items { ${ITEM_FIELDS} }`;

export const INVOICES_QUERY: TypedDocumentNode<
  { invoices: InvoiceConnection },
  {
    status?: InvoiceStatus;
    clientId?: number;
    search?: string;
    pagination?: { limit?: number; cursor?: number };
  }
> = gql`
  query Invoices($status: InvoiceStatus, $clientId: Int, $search: String, $pagination: PaginationInput) {
    invoices(status: $status, clientId: $clientId, search: $search, pagination: $pagination) {
      items { ${INV_FIELDS} }
      nextCursor
      total
    }
  }
`;

export const INVOICE_QUERY: TypedDocumentNode<
  { invoice: Invoice },
  { id: number }
> = gql`
  query Invoice($id: Int!) {
    invoice(id: $id) { ${INV_FIELDS} }
  }
`;

export const CREATE_INVOICE_MUTATION: TypedDocumentNode<
  { createInvoice: Invoice },
  {
    input: {
      clientId?: number;
      currency?: string;
      dueDate?: string;
      notes?: string;
    };
  }
> = gql`
  mutation CreateInvoice($input: CreateInvoiceInput!) {
    createInvoice(input: $input) { ${INV_FIELDS} }
  }
`;

export const GENERATE_INVOICE_MUTATION: TypedDocumentNode<
  { generateInvoice: Invoice },
  {
    input: {
      projectId: number;
      clientId?: number;
      currency?: string;
      dueDate?: string;
      hourlyRate?: number;
    };
  }
> = gql`
  mutation GenerateInvoice($input: GenerateInvoiceInput!) {
    generateInvoice(input: $input) { ${INV_FIELDS} }
  }
`;

export const UPDATE_INVOICE_MUTATION: TypedDocumentNode<
  { updateInvoice: Invoice },
  {
    input: {
      id: number;
      status?: InvoiceStatus;
      currency?: string;
      dueDate?: string;
      paidAt?: string;
      notes?: string;
      clientId?: number;
    };
  }
> = gql`
  mutation UpdateInvoice($input: UpdateInvoiceInput!) {
    updateInvoice(input: $input) { ${INV_FIELDS} }
  }
`;

export const DELETE_INVOICE_MUTATION: TypedDocumentNode<
  { deleteInvoice: boolean },
  { id: number }
> = gql`
  mutation DeleteInvoice($id: Int!) {
    deleteInvoice(id: $id)
  }
`;

export const ADD_INVOICE_ITEM_MUTATION: TypedDocumentNode<
  { addInvoiceItem: InvoiceItem },
  {
    input: {
      invoiceId: number;
      description?: string;
      quantity: number;
      unitPrice: number;
      projectId?: number;
      timeEntryId?: number;
    };
  }
> = gql`
  mutation AddInvoiceItem($input: AddInvoiceItemInput!) {
    addInvoiceItem(input: $input) { ${ITEM_FIELDS} }
  }
`;

export const UPDATE_INVOICE_ITEM_MUTATION: TypedDocumentNode<
  { updateInvoiceItem: InvoiceItem },
  {
    input: {
      id: number;
      description?: string;
      quantity?: number;
      unitPrice?: number;
    };
  }
> = gql`
  mutation UpdateInvoiceItem($input: UpdateInvoiceItemInput!) {
    updateInvoiceItem(input: $input) { ${ITEM_FIELDS} }
  }
`;

export const REMOVE_INVOICE_ITEM_MUTATION: TypedDocumentNode<
  { removeInvoiceItem: boolean },
  { id: number }
> = gql`
  mutation RemoveInvoiceItem($id: Int!) {
    removeInvoiceItem(id: $id)
  }
`;
