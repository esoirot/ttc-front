export type TranslationRateType = "HOURLY" | "DAY" | "PER_WORD" | "FIXED";

export interface TranslationRate {
  id: number;
  userId: number;
  occupationId?: number | null;
  clientId?: number | null;
  type: TranslationRateType;
  name: string;
  amount: number;
  currency: string;
  description: string | null;
  sourceLanguage?: string | null;
  targetLanguage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TranslationRateFormData = {
  name: string;
  amount: number;
  currency: string;
  description?: string | null;
  occupationId?: number | null;
  clientId?: number | null;
  sourceLanguage?: string | null;
  targetLanguage?: string | null;
};

export interface OverviewSectionProps {
  type: TranslationRateType;
  rates: TranslationRate[];
  loading: boolean;
}

export interface TranslationRateFormProps {
  type: TranslationRateType;
  initial?: TranslationRate;
  defaultOccupationId?: number;
  onSave: (data: TranslationRateFormData) => void;
  onCancel: () => void;
  saving: boolean;
}

export interface TranslationRateListProps {
  type: TranslationRateType;
}

export interface TranslationRateRowProps {
  rate: TranslationRate;
  onEdit: () => void;
  onDelete: () => void;
}

export type Rate = TranslationRate;

export type CreateRateInput = {
  type: TranslationRateType;
  occupationId?: number | null;
  name: string;
  amount: number;
  currency: string;
  description?: string | null;
  clientId?: number | null;
  sourceLanguage?: string | null;
  targetLanguage?: string | null;
};

export type UpdateRateInput = {
  id: number;
  type?: TranslationRateType;
  occupationId?: number | null;
  name?: string;
  amount?: number;
  currency?: string;
  description?: string | null;
  clientId?: number | null;
  sourceLanguage?: string | null;
  targetLanguage?: string | null;
};
