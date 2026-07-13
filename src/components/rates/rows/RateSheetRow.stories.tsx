import type { Meta, StoryObj } from "@storybook/react-vite";
import type { RateSheet } from "@/types/rate-sheets.types";
import { defaultMatchRates } from "@/constants/matchRateItems";
import { RateSheetRow } from "./RateSheetRow";

const sheet: RateSheet = {
  id: 1,
  userId: 1,
  activityId: null,
  clientId: 1,
  name: "EN>FR standard",
  description: "Standard sheet for the Acme account",
  sourceLanguage: "EN",
  targetLanguage: "FR",
  currency: "EUR",
  pricePerWord: 0.12,
  matchRates: defaultMatchRates(),
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const meta: Meta<typeof RateSheetRow> = {
  component: RateSheetRow,
  title: "Organisms/RateSheetRow",
  args: {
    sheet,
    clientName: "Acme Corp",
    onEdit: () => {},
    onDelete: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof RateSheetRow>;

export const Default: Story = {};

export const NoClient: Story = {
  args: { sheet: { ...sheet, id: 2, clientId: null }, clientName: undefined },
};
