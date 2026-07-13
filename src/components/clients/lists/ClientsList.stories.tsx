import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { ClientsList } from "./ClientsList";

const meta: Meta<typeof ClientsList> = {
  component: ClientsList,
  title: "Organisms/ClientsList",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "No backend/MSW mocking is configured yet — useClients() fires a real query that fails fast in Storybook's sandbox, so the list renders its loading skeletons/empty state. That's an accepted current limitation, not a per-story bug.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ClientsList>;

export const Default: Story = {};
