export type TranslationRateType = "HOURLY" | "DAY" | "PER_WORD" | "FIXED";

export interface TranslationRate {
  id: number;
  userId: number;
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
  description?: string;
  clientId?: number | null;
  sourceLanguage?: string;
  targetLanguage?: string;
};

export interface OverviewSectionProps {
  type: TranslationRateType;
  rates: TranslationRate[];
  loading: boolean;
}

export interface TranslationRateFormProps {
  type: TranslationRateType;
  initial?: TranslationRate;
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
