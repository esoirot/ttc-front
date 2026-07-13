import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ActivityInfoForm } from "./ActivityInfoForm";

const meta: Meta<typeof ActivityInfoForm> = {
  component: ActivityInfoForm,
  title: "Molecules/ActivityInfoForm",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  args: {
    activityId: 1,
    initial: {
      name: "Freelance Translation",
      companyName: "Acme Translations SARL",
      legalForm: "SARL",
      professionalEmail: "contact@acme-translations.example",
      professionalPhone: "+33 1 23 45 67 89",
      website: "https://acme-translations.example",
      timezone: "Europe/Paris",
    },
  },
};
export default meta;
type Story = StoryObj<typeof ActivityInfoForm>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    initial: {
      name: "New activity",
      companyName: null,
      legalForm: null,
      professionalEmail: null,
      professionalPhone: null,
      website: null,
      timezone: null,
    },
  },
};
