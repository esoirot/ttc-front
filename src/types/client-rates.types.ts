import type { RateType } from "./rates.types";

export type { RateType };

export interface ClientRate {
  id: number;
  clientId: number;
  userId: number;
  type: RateType;
  name: string;
  amount: number;
  currency: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
