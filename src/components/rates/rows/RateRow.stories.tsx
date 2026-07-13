import type { Meta, StoryObj } from "@storybook/react-vite";
import type { TranslationRate } from "@/types/rates.types";
import { RateRow } from "./RateRow";

const rate: TranslationRate = {
  id: 1,
  userId: 1,
  activityId: null,
  clientId: null,
  type: "HOURLY",
  name: "Standard hourly rate",
  amount: 45,
  currency: "EUR",
  description: "General translation work",
  sourceLanguage: "EN",
  targetLanguage: "FR",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const meta: Meta<typeof RateRow> = {
  component: RateRow,
  title: "Organisms/RateRow",
  args: {
    rate,
    onEdit: () => {},
    onDelete: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof RateRow>;

export const Default: Story = {};

export const PerWord: Story = {
  args: {
    rate: {
      ...rate,
      id: 2,
      type: "PER_WORD",
      name: "Per-word rate",
      amount: 0.12,
      sourceLanguage: null,
      targetLanguage: null,
      description: null,
    },
  },
};

export const NoLanguagePair: Story = {
  args: {
    rate: { ...rate, id: 3, sourceLanguage: null, targetLanguage: null },
  },
};
