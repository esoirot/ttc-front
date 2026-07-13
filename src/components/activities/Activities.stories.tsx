import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { Activities } from "./Activities";

const meta: Meta<typeof Activities> = {
  component: Activities,
  title: "Organisms/Activities",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/activities"]}>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "No backend/MSW mocking is configured yet — `useMyActivities()` fires a real query that fails fast in Storybook's sandbox and settles into the empty state below. That's an accepted limitation, not a bug.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Activities>;

export const Default: Story = {};
