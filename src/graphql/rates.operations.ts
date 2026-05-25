import { gql } from "@apollo/client/core";
import type { TypedDocumentNode } from "@apollo/client/core";
import type { RateType, Rate } from "@/types/rates.types";

export type { RateType, Rate };

const RATE_FIELDS = `id userId type name amount currency description createdAt updatedAt`;

export const RATES_QUERY: TypedDocumentNode<
  { rates: Rate[] },
  { type?: RateType }
> = gql`
  query Rates($type: RateType) {
    rates(type: $type) { ${RATE_FIELDS} }
  }
`;

export const CREATE_RATE_MUTATION: TypedDocumentNode<
  { createRate: Rate },
  {
    input: {
      type: RateType;
      name: string;
      amount: number;
      currency: string;
      description?: string;
    };
  }
> = gql`
  mutation CreateRate($input: CreateRateInput!) {
    createRate(input: $input) { ${RATE_FIELDS} }
  }
`;

export const UPDATE_RATE_MUTATION: TypedDocumentNode<
  { updateRate: Rate },
  {
    input: {
      id: number;
      type?: RateType;
      name?: string;
      amount?: number;
      currency?: string;
      description?: string;
    };
  }
> = gql`
  mutation UpdateRate($input: UpdateRateInput!) {
    updateRate(input: $input) { ${RATE_FIELDS} }
  }
`;

export const DELETE_RATE_MUTATION: TypedDocumentNode<
  { deleteRate: boolean },
  { id: number }
> = gql`
  mutation DeleteRate($id: Int!) {
    deleteRate(id: $id)
  }
`;
