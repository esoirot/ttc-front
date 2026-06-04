import { gql } from "@apollo/client/core";
import type { TypedDocumentNode } from "@apollo/client/core";
import type {
  RateSheet,
  CreateRateSheetInput,
  UpdateRateSheetInput,
} from "@/types/rate-sheets.types";

const MATCH_RATE_FIELDS = `
  perfectMatch
  cm
  repetitions
  repetitionsBetweenFiles
  match100
  match95_99
  match85_94
  match75_84
  match50_74
  referenceAdaptativeMT
  adaptativeMTWithLearning
  newWordsTA
`;

const RATE_SHEET_FIELDS = `
  id
  userId
  clientId
  name
  description
  sourceLanguage
  targetLanguage
  currency
  pricePerWord
  matchRates { ${MATCH_RATE_FIELDS} }
  createdAt
  updatedAt
`;

export const RATE_SHEETS_QUERY: TypedDocumentNode<
  { rateSheets: RateSheet[] },
  Record<string, never>
> = gql`
  query RateSheets {
    rateSheets { ${RATE_SHEET_FIELDS} }
  }
`;

export const RATE_SHEET_QUERY: TypedDocumentNode<
  { rateSheet: RateSheet },
  { id: number }
> = gql`
  query RateSheet($id: Int!) {
    rateSheet(id: $id) { ${RATE_SHEET_FIELDS} }
  }
`;

export const CREATE_RATE_SHEET_MUTATION: TypedDocumentNode<
  { createRateSheet: RateSheet },
  { input: CreateRateSheetInput }
> = gql`
  mutation CreateRateSheet($input: CreateRateSheetInput!) {
    createRateSheet(input: $input) { ${RATE_SHEET_FIELDS} }
  }
`;

export const UPDATE_RATE_SHEET_MUTATION: TypedDocumentNode<
  { updateRateSheet: RateSheet },
  { input: UpdateRateSheetInput }
> = gql`
  mutation UpdateRateSheet($input: UpdateRateSheetInput!) {
    updateRateSheet(input: $input) { ${RATE_SHEET_FIELDS} }
  }
`;

export const DELETE_RATE_SHEET_MUTATION: TypedDocumentNode<
  { deleteRateSheet: boolean },
  { id: number }
> = gql`
  mutation DeleteRateSheet($id: Int!) {
    deleteRateSheet(id: $id)
  }
`;
