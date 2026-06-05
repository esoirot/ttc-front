import type { MatchRates } from "@/constants/matchRateItems";

export type { MatchRates };

export interface RateSheet {
  id: number;
  userId: number;
  activityId?: number | null;
  clientId: number | null;
  name: string;
  description: string | null;
  sourceLanguage: string;
  targetLanguage: string;
  currency: string;
  pricePerWord: number;
  matchRates: MatchRates;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRateSheetInput {
  activityId?: number | null;
  clientId?: number | null;
  name: string;
  description?: string;
  sourceLanguage: string;
  targetLanguage: string;
  currency: string;
  pricePerWord: number;
  matchRates: MatchRates;
}

export interface UpdateRateSheetInput {
  id: number;
  activityId?: number | null;
  clientId?: number | null;
  name?: string;
  description?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  currency?: string;
  pricePerWord?: number;
  matchRates?: MatchRates;
}
