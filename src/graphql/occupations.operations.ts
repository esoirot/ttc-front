import { gql } from "@apollo/client/core";
import type { TypedDocumentNode } from "@apollo/client/core";
import type {
  AnyOccupation,
  OccupationType,
  Charge,
} from "@/types/occupations.types";

const OCCUPATION_FIELDS = gql`
  fragment OccupationFields on Occupation {
    id
    userId
    name
    occupationType
    companyName
    legalForm
    professionalEmail
    professionalPhone
    website
    timezone
    objectiveQ1
    objectiveQ2
    objectiveQ3
    objectiveQ4
    charges {
      id
      occupationId
      name
      amount
      type
    }
    translationRates {
      id
      occupationId
      clientId
      type
      name
      amount
      currency
      description
      sourceLanguage
      targetLanguage
    }
    createdAt
    updatedAt
    ... on TranslatorOccupation {
      languagePairs {
        id
        fromLanguage
        toLanguage
      }
    }
    ... on CustomOccupation {
      customFields {
        id
        key
        value
      }
    }
  }
`;

export const MY_OCCUPATIONS_QUERY: TypedDocumentNode<
  { myOccupations: AnyOccupation[] },
  Record<string, never>
> = gql`
  ${OCCUPATION_FIELDS}
  query MyOccupations {
    myOccupations {
      ...OccupationFields
    }
  }
`;

export const OCCUPATION_QUERY: TypedDocumentNode<
  { occupation: AnyOccupation },
  { id: number }
> = gql`
  ${OCCUPATION_FIELDS}
  query Occupation($id: Int!) {
    occupation(id: $id) {
      ...OccupationFields
    }
  }
`;

export const CREATE_OCCUPATION_MUTATION: TypedDocumentNode<
  { createOccupation: AnyOccupation },
  {
    input: {
      name: string;
      occupationType?: OccupationType | null;
      companyName?: string | null;
      legalForm?: string | null;
      professionalEmail?: string | null;
      professionalPhone?: string | null;
      website?: string | null;
      timezone?: string | null;
      languagePairs?: { fromLanguage: string; toLanguage: string }[] | null;
      customFields?: { key: string; value: string }[] | null;
    };
  }
> = gql`
  ${OCCUPATION_FIELDS}
  mutation CreateOccupation($input: CreateOccupationInput!) {
    createOccupation(input: $input) {
      ...OccupationFields
    }
  }
`;

export const UPDATE_OCCUPATION_MUTATION: TypedDocumentNode<
  { updateOccupation: AnyOccupation },
  {
    input: {
      id: number;
      name?: string | null;
      companyName?: string | null;
      legalForm?: string | null;
      professionalEmail?: string | null;
      professionalPhone?: string | null;
      website?: string | null;
      timezone?: string | null;
      objectiveQ1?: number | null;
      objectiveQ2?: number | null;
      objectiveQ3?: number | null;
      objectiveQ4?: number | null;
      languagePairs?: { fromLanguage: string; toLanguage: string }[] | null;
      customFields?: { key: string; value: string }[] | null;
    };
  }
> = gql`
  ${OCCUPATION_FIELDS}
  mutation UpdateOccupation($input: UpdateOccupationInput!) {
    updateOccupation(input: $input) {
      ...OccupationFields
    }
  }
`;

export const DELETE_OCCUPATION_MUTATION: TypedDocumentNode<
  { deleteOccupation: boolean },
  { id: number }
> = gql`
  mutation DeleteOccupation($id: Int!) {
    deleteOccupation(id: $id)
  }
`;

export const CREATE_CHARGE_MUTATION: TypedDocumentNode<
  { createCharge: Charge },
  {
    input: { occupationId: number; name: string; amount: number; type: string };
  }
> = gql`
  mutation CreateCharge($input: CreateChargeInput!) {
    createCharge(input: $input) {
      id
      occupationId
      name
      amount
      type
    }
  }
`;

export const UPDATE_CHARGE_MUTATION: TypedDocumentNode<
  { updateCharge: Charge },
  {
    input: {
      id: number;
      name?: string | null;
      amount?: number | null;
      type?: string | null;
    };
  }
> = gql`
  mutation UpdateCharge($input: UpdateChargeInput!) {
    updateCharge(input: $input) {
      id
      occupationId
      name
      amount
      type
    }
  }
`;

export const DELETE_CHARGE_MUTATION: TypedDocumentNode<
  { deleteCharge: boolean },
  { id: number }
> = gql`
  mutation DeleteCharge($id: Int!) {
    deleteCharge(id: $id)
  }
`;
