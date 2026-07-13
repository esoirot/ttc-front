import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { GoogleCalendarPage } from "./GoogleCalendarPage";

const meta: Meta<typeof GoogleCalendarPage> = {
  component: GoogleCalendarPage,
  title: "Pages/GoogleCalendarPage",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/google-calendar"]}>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "note: ungated queries fire against no backend/MSW in Storybook's sandbox, so this renders its loading/error fallback state — accepted limitation, not a bug.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof GoogleCalendarPage>;

export const Default: Story = {};
