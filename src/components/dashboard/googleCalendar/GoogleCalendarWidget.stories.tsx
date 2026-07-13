import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { GoogleCalendarWidget } from "./GoogleCalendarWidget";

const meta: Meta<typeof GoogleCalendarWidget> = {
  component: GoogleCalendarWidget,
  title: "Organisms/GoogleCalendarWidget",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <div className="max-w-xs">
            <Story />
          </div>
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "No backend/MSW mocking is configured yet — `useGoogleCalendarStatus()` fires a real query that fails fast in Storybook's sandbox and settles into the loading-skeleton state. That's an accepted limitation, not a bug.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof GoogleCalendarWidget>;

export const Default: Story = {};
