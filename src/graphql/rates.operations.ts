import { gql } from "@apollo/client/core";
import type { TypedDocumentNode } from "@apollo/client/core";
import type { TranslationRateType, TranslationRate } from "@/types/rates.types";

export type { TranslationRateType, TranslationRate };

const TRANSLATION_RATE_FIELDS = `id userId activityId clientId type name amount currency description sourceLanguage targetLanguage createdAt updatedAt`;

export const TRANSLATION_RATES_QUERY: TypedDocumentNode<
  { translationRates: TranslationRate[] },
  { type?: TranslationRateType }
> = gql`
  query TranslationRates($type: TranslationRateType) {
    translationRates(type: $type) { ${TRANSLATION_RATE_FIELDS} }
  }
`;

export const CREATE_TRANSLATION_RATE_MUTATION: TypedDocumentNode<
  { createTranslationRate: TranslationRate },
  {
    input: {
      type: TranslationRateType;
      activityId?: number | null;
      name: string;
      amount: number;
      currency: string;
      description?: string;
      clientId?: number | null;
      sourceLanguage?: string;
      targetLanguage?: string;
    };
  }
> = gql`
  mutation CreateTranslationRate($input: CreateTranslationRateInput!) {
    createTranslationRate(input: $input) { ${TRANSLATION_RATE_FIELDS} }
  }
`;

export const UPDATE_TRANSLATION_RATE_MUTATION: TypedDocumentNode<
  { updateTranslationRate: TranslationRate },
  {
    input: {
      id: number;
      type?: TranslationRateType;
      activityId?: number | null;
      name?: string;
      amount?: number;
      currency?: string;
      description?: string;
      clientId?: number | null;
      sourceLanguage?: string;
      targetLanguage?: string;
    };
  }
> = gql`
  mutation UpdateTranslationRate($input: UpdateTranslationRateInput!) {
    updateTranslationRate(input: $input) { ${TRANSLATION_RATE_FIELDS} }
  }
`;

export const DELETE_TRANSLATION_RATE_MUTATION: TypedDocumentNode<
  { deleteTranslationRate: boolean },
  { id: number }
> = gql`
  mutation DeleteTranslationRate($id: Int!) {
    deleteTranslationRate(id: $id)
  }
`;
