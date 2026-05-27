import { gql } from "@apollo/client/core";
import type { TypedDocumentNode } from "@apollo/client/core";
import type {
  Client,
  ClientConnection,
  ClientType,
  ClientIndustry,
  CompanyContact,
} from "@/types/clients.types";

const CONTACT_FIELDS = `id clientId firstName lastName email phone createdAt updatedAt`;

const CLIENT_FIELDS = `
  id userId name legalName email phone company address
  city country postalCode vatNumber
  notes hubspotId
  clientType firstName lastName paymentDelayDays taxRate billingEndOfMonth
  website industry tags { id name }
  createdAt updatedAt
  contacts { ${CONTACT_FIELDS} }
`;

export const CLIENTS_QUERY: TypedDocumentNode<
  { clients: ClientConnection },
  {
    search?: string;
    clientType?: ClientType;
    pagination?: { limit?: number; cursor?: number };
  }
> = gql`
  query Clients($search: String, $clientType: ClientType, $pagination: PaginationInput) {
    clients(search: $search, clientType: $clientType, pagination: $pagination) {
      items { ${CLIENT_FIELDS} }
      nextCursor
      total
    }
  }
`;

export const CLIENT_QUERY: TypedDocumentNode<
  { client: Client },
  { id: number }
> = gql`
  query Client($id: Int!) {
    client(id: $id) { ${CLIENT_FIELDS} }
  }
`;

type ClientInput = {
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
  tagIds?: number[];
};

export const CREATE_CLIENT_MUTATION: TypedDocumentNode<
  { createClient: Client },
  { input: ClientInput }
> = gql`
  mutation CreateClient($input: CreateClientInput!) {
    createClient(input: $input) { ${CLIENT_FIELDS} }
  }
`;

export const UPDATE_CLIENT_MUTATION: TypedDocumentNode<
  { updateClient: Client },
  { input: Partial<ClientInput> & { id: number } }
> = gql`
  mutation UpdateClient($input: UpdateClientInput!) {
    updateClient(input: $input) { ${CLIENT_FIELDS} }
  }
`;

export const DELETE_CLIENT_MUTATION: TypedDocumentNode<
  { deleteClient: boolean },
  { id: number }
> = gql`
  mutation DeleteClient($id: Int!) {
    deleteClient(id: $id)
  }
`;

type ContactInput = {
  clientId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

export const CREATE_COMPANY_CONTACT_MUTATION: TypedDocumentNode<
  { createCompanyContact: CompanyContact },
  { input: ContactInput }
> = gql`
  mutation CreateCompanyContact($input: CreateCompanyContactInput!) {
    createCompanyContact(input: $input) { ${CONTACT_FIELDS} }
  }
`;

export const UPDATE_COMPANY_CONTACT_MUTATION: TypedDocumentNode<
  { updateCompanyContact: CompanyContact },
  { input: Partial<Omit<ContactInput, "clientId">> & { id: number } }
> = gql`
  mutation UpdateCompanyContact($input: UpdateCompanyContactInput!) {
    updateCompanyContact(input: $input) { ${CONTACT_FIELDS} }
  }
`;

export const DELETE_COMPANY_CONTACT_MUTATION: TypedDocumentNode<
  { deleteCompanyContact: boolean },
  { id: number }
> = gql`
  mutation DeleteCompanyContact($id: Int!) {
    deleteCompanyContact(id: $id)
  }
`;
