import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { Occupations } from "./Occupations";

const meta: Meta<typeof Occupations> = {
  component: Occupations,
  title: "Organisms/Occupations",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <QueryClientProvider client={new QueryClient()}>
          <MemoryRouter initialEntries={["/occupations"]}>
            <Story />
          </MemoryRouter>
        </QueryClientProvider>
      </IntlProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "No backend/MSW mocking is configured yet — `useMyOccupations()` fires a real query that fails fast in Storybook's sandbox and settles into the empty state below. That's an accepted limitation, not a bug.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Occupations>;

export const Default: Story = {};
