export type ChargeType = "FIXED" | "VARIABLE";

export type ActivityType = "TRANSLATOR" | "CORRECTOR" | "CUSTOM";

export interface Charge {
  id: number;
  activityId: number;
  name: string;
  amount: number;
  type: ChargeType;
}

export interface LanguagePair {
  id: number;
  activityId: number;
  fromLanguage: string;
  toLanguage: string;
}

export interface CustomField {
  id: number;
  activityId: number;
  key: string;
  value: string;
}

export interface Activity {
  id: number;
  userId: number;
  name: string;
  activityType: ActivityType;
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
  createdAt: string;
  updatedAt: string;
}

export interface TranslatorActivity extends Activity {
  languagePairs: LanguagePair[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CorrectorActivity extends Activity {}

export interface CustomActivity extends Activity {
  customFields: CustomField[];
}

export type AnyActivity =
  | TranslatorActivity
  | CorrectorActivity
  | CustomActivity;

export interface LanguagePairDraft {
  fromLanguage: string;
  toLanguage: string;
}

export interface CustomFieldDraft {
  key: string;
  value: string;
}

export function isTranslatorActivity(a: AnyActivity): a is TranslatorActivity {
  return a.activityType === "TRANSLATOR";
}

export interface ActivityCardProps {
  activity: AnyActivity;
  onDelete: (id: number) => void;
}

export interface ActivityInfoFormProps {
  activityId: number;
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
  activityId: number;
  type: ChargeType;
}

export interface ChargeRowProps {
  charge: Charge;
  activityId: number;
}

export interface CreateActivityFormProps {
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
  activityId: number;
  initialPairs: LanguagePair[];
}

export interface ObjectivesFormProps {
  activityId: number;
  initial: {
    objectiveQ1?: number | null;
    objectiveQ2?: number | null;
    objectiveQ3?: number | null;
    objectiveQ4?: number | null;
  };
}
