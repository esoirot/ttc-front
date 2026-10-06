import type { TranslationRate } from "./rates.types";

export type { TranslationRate };

export type ChargeType = "FIXED" | "VARIABLE";

export type OccupationType = "TRANSLATOR" | "CORRECTOR" | "CUSTOM";

export interface Charge {
  id: number;
  occupationId: number;
  name: string;
  amount: number;
  type: ChargeType;
}

export interface LanguagePair {
  id: number;
  occupationId: number;
  fromLanguage: string;
  toLanguage: string;
}

export interface CustomField {
  id: number;
  occupationId: number;
  key: string;
  value: string;
}

export interface Occupation {
  id: number;
  userId: number;
  name: string;
  occupationType: OccupationType;
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
  charges: Charge[];
  translationRates: TranslationRate[];
  createdAt: string;
  updatedAt: string;
}

export interface TranslatorOccupation extends Occupation {
  languagePairs: LanguagePair[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CorrectorOccupation extends Occupation {}

export interface CustomOccupation extends Occupation {
  customFields: CustomField[];
}

export type AnyOccupation =
  TranslatorOccupation | CorrectorOccupation | CustomOccupation;

// Minimal shape used wherever a Client/Project/TimeEntry references an
// Occupation — those queries only ever select { id name occupationType }, not
// the full Occupation interface's charges/translationRates/etc.
export interface OccupationRef {
  id: number;
  name: string;
  occupationType: OccupationType;
}

export interface LanguagePairDraft {
  fromLanguage: string;
  toLanguage: string;
}

export interface CustomFieldDraft {
  key: string;
  value: string;
}

export function isTranslatorOccupation(
  a: AnyOccupation,
): a is TranslatorOccupation {
  return a.occupationType === "TRANSLATOR";
}

export function isCustomOccupation(a: AnyOccupation): a is CustomOccupation {
  return a.occupationType === "CUSTOM";
}

export interface OccupationCardProps {
  occupation: AnyOccupation;
  onDelete: (id: number) => void;
}

export interface OccupationInfoFormProps {
  occupationId: number;
  initial: {
    name: string;
    companyName?: string | null;
    legalForm?: string | null;
    professionalEmail?: string | null;
    professionalPhone?: string | null;
    website?: string | null;
    timezone?: string | null;
  };
}

export interface AddChargeFormProps {
  occupationId: number;
  type: ChargeType;
}

export interface ChargeRowProps {
  charge: Charge;
  occupationId: number;
}

export interface CreateOccupationFormProps {
  onCancel: () => void;
}

export interface CustomFieldsInputProps {
  fields: CustomFieldDraft[];
  onAdd: () => void;
  onUpdate: (
    index: number,
    field: keyof CustomFieldDraft,
    value: string,
  ) => void;
  onRemove: (index: number) => void;
}

export interface CustomFieldsSectionProps {
  occupationId: number;
  initialFields: CustomField[];
}

export interface LanguagePairsInputProps {
  pairs: LanguagePairDraft[];
  onAdd: () => void;
  onUpdate: (
    index: number,
    field: keyof LanguagePairDraft,
    value: string,
  ) => void;
  onRemove: (index: number) => void;
}

export interface LanguagePairsSectionProps {
  occupationId: number;
  initialPairs: LanguagePair[];
}

export interface ObjectivesFormProps {
  occupationId: number;
  initial: {
    objectiveQ1?: number | null;
    objectiveQ2?: number | null;
    objectiveQ3?: number | null;
    objectiveQ4?: number | null;
  };
}
