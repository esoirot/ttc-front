import { gql } from "@apollo/client/core";
import type { TypedDocumentNode } from "@apollo/client/core";
import type { ClientRate } from "@/types/client-rates.types";

const CLIENT_RATE_FIELDS = `
  id clientId userId type name amount currency description createdAt updatedAt
`;

export const CLIENT_RATES_QUERY: TypedDocumentNode<
  { clientRates: ClientRate[] },
  { clientId: number }
> = gql`
  query ClientRates($clientId: Int!) {
    clientRates(clientId: $clientId) { ${CLIENT_RATE_FIELDS} }
  }
`;

export const CREATE_CLIENT_RATE_MUTATION: TypedDocumentNode<
  { createClientRate: ClientRate },
  {
    input: {
      clientId: number;
      type: string;
      name: string;
      amount: number;
      currency?: string;
      description?: string;
    };
  }
> = gql`
  mutation CreateClientRate($input: CreateClientRateInput!) {
    createClientRate(input: $input) { ${CLIENT_RATE_FIELDS} }
  }
`;

export const UPDATE_CLIENT_RATE_MUTATION: TypedDocumentNode<
  { updateClientRate: ClientRate },
  {
    input: {
      id: number;
      type?: string;
      name?: string;
      amount?: number;
      currency?: string;
      description?: string;
    };
  }
> = gql`
  mutation UpdateClientRate($input: UpdateClientRateInput!) {
    updateClientRate(input: $input) { ${CLIENT_RATE_FIELDS} }
  }
`;

export const DELETE_CLIENT_RATE_MUTATION: TypedDocumentNode<
  { deleteClientRate: boolean },
  { id: number }
> = gql`
  mutation DeleteClientRate($id: Int!) {
    deleteClientRate(id: $id)
  }
`;
