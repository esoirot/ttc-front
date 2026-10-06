import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { OccupationInfoForm } from "./OccupationInfoForm";

const meta: Meta<typeof OccupationInfoForm> = {
  component: OccupationInfoForm,
  title: "Molecules/OccupationInfoForm",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <Story />
        </IntlProvider>
      </QueryClientProvider>
    ),
  ],
  args: {
    occupationId: 1,
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
type Story = StoryObj<typeof OccupationInfoForm>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    initial: {
      name: "New occupation",
      companyName: null,
      legalForm: null,
      professionalEmail: null,
      professionalPhone: null,
      website: null,
      timezone: null,
    },
  },
};
