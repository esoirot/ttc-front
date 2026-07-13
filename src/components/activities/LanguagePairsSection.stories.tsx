import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguagePairsSection } from "./LanguagePairsSection";

const meta: Meta<typeof LanguagePairsSection> = {
  component: LanguagePairsSection,
  title: "Molecules/LanguagePairsSection",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  args: {
    activityId: 1,
    initialPairs: [
      { id: 1, activityId: 1, fromLanguage: "EN", toLanguage: "FR" },
      { id: 2, activityId: 1, fromLanguage: "DE", toLanguage: "ES" },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof LanguagePairsSection>;

export const Default: Story = {};

export const Empty: Story = { args: { initialPairs: [] } };
