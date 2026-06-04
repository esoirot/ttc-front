import { gql } from "@apollo/client/core";
import type { TypedDocumentNode } from "@apollo/client/core";
import type {
  AnyActivity,
  ActivityType,
  Charge,
} from "@/types/activities.types";

const ACTIVITY_FIELDS = gql`
  fragment ActivityFields on Activity {
    id
    userId
    name
    activityType
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
      activityId
      name
      amount
      type
    }
    createdAt
    updatedAt
    ... on TranslatorActivity {
      languagePairs {
        id
        fromLanguage
        toLanguage
      }
    }
    ... on CustomActivity {
      customFields {
        id
        key
        value
      }
    }
  }
`;

export const MY_ACTIVITIES_QUERY: TypedDocumentNode<
  { myActivities: AnyActivity[] },
  Record<string, never>
> = gql`
  ${ACTIVITY_FIELDS}
  query MyActivities {
    myActivities {
      ...ActivityFields
    }
  }
`;

export const ACTIVITY_QUERY: TypedDocumentNode<
  { activity: AnyActivity },
  { id: number }
> = gql`
  ${ACTIVITY_FIELDS}
  query Activity($id: Int!) {
    activity(id: $id) {
      ...ActivityFields
    }
  }
`;

export const CREATE_ACTIVITY_MUTATION: TypedDocumentNode<
  { createActivity: AnyActivity },
  {
    input: {
      name: string;
      activityType?: ActivityType | null;
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
  ${ACTIVITY_FIELDS}
  mutation CreateActivity($input: CreateActivityInput!) {
    createActivity(input: $input) {
      ...ActivityFields
    }
  }
`;

export const UPDATE_ACTIVITY_MUTATION: TypedDocumentNode<
  { updateActivity: AnyActivity },
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
    };
  }
> = gql`
  ${ACTIVITY_FIELDS}
  mutation UpdateActivity($input: UpdateActivityInput!) {
    updateActivity(input: $input) {
      ...ActivityFields
    }
  }
`;

export const DELETE_ACTIVITY_MUTATION: TypedDocumentNode<
  { deleteActivity: boolean },
  { id: number }
> = gql`
  mutation DeleteActivity($id: Int!) {
    deleteActivity(id: $id)
  }
`;

export const CREATE_CHARGE_MUTATION: TypedDocumentNode<
  { createCharge: Charge },
  { input: { activityId: number; name: string; amount: number; type: string } }
> = gql`
  mutation CreateCharge($input: CreateChargeInput!) {
    createCharge(input: $input) {
      id
      activityId
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
      activityId
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
