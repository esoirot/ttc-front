export type RateType = "HOURLY" | "PER_WORD" | "FIXED";

export interface Rate {
  id: number;
  userId: number;
  type: RateType;
  name: string;
  amount: number;
  currency: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export type RateFormData = {
  name: string;
  amount: number;
  currency: string;
  description?: string;
};

export interface OverviewSectionProps {
  type: RateType;
  rates: Rate[];
  loading: boolean;
}

export interface RateFormProps {
  type: RateType;
  initial?: Rate;
  onSave: (data: RateFormData) => void;
  onCancel: () => void;
  saving: boolean;
}

export interface RateListProps {
  type: RateType;
}

export interface RateRowProps {
  rate: Rate;
  onEdit: () => void;
  onDelete: () => void;
}
