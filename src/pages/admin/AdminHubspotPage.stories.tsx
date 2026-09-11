import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { AdminHubspotPage } from "./AdminHubspotPage";

const meta: Meta<typeof AdminHubspotPage> = {
  component: AdminHubspotPage,
  title: "Pages/AdminHubspotPage",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <MemoryRouter initialEntries={["/admin/hubspot"]}>
            <Story />
          </MemoryRouter>
        </IntlProvider>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "note: ungated queries fire against no backend/MSW in Storybook's sandbox, so this renders its loading/error fallback state — accepted limitation, not a bug. Role-gated content (this is an admin page, gated by useCurrentUser) also falls back accordingly.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof AdminHubspotPage>;

export const Default: Story = {};
