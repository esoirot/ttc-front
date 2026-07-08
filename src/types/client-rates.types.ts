import type { TranslationRateType } from "./rates.types";

export type { TranslationRateType as RateType };

export interface ClientRate {
  id: number;
  clientId: number;
  userId: number;
  type: TranslationRateType;
  name: string;
  amount: number;
  currency: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ClientRateFormData = {
  type: TranslationRateType;
  name: string;
  amount: string;
  currency: string;
  description: string;
};
