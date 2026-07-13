import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { TranslationRate } from "@/types/rates.types";
import { OverviewSection } from "./OverviewSection";

function makeRate(overrides: Partial<TranslationRate>): TranslationRate {
  return {
    id: 1,
    userId: 1,
    activityId: null,
    clientId: null,
    type: "HOURLY",
    name: "Standard rate",
    amount: 45,
    currency: "EUR",
    description: null,
    sourceLanguage: null,
    targetLanguage: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const rates: TranslationRate[] = [
  makeRate({ id: 1, name: "Standard hourly", amount: 45 }),
  makeRate({
    id: 2,
    name: "Rush hourly",
    amount: 65,
    sourceLanguage: "EN",
    targetLanguage: "FR",
  }),
];

const meta: Meta<typeof OverviewSection> = {
  component: OverviewSection,
  title: "Organisms/OverviewSection",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  args: {
    type: "HOURLY",
    rates,
    loading: false,
  },
};
export default meta;
type Story = StoryObj<typeof OverviewSection>;

export const Default: Story = {};

export const Loading: Story = {
  args: { rates: [], loading: true },
};

export const Empty: Story = {
  args: { rates: [], loading: false },
};
