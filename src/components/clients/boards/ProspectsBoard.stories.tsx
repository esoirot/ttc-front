import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { ProspectsBoard } from "./ProspectsBoard";

const meta: Meta<typeof ProspectsBoard> = {
  component: ProspectsBoard,
  title: "Organisms/ProspectsBoard",
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
          "No backend/MSW mocking is configured yet — useClients() fires a real query that fails fast in Storybook's sandbox, so the board renders its loading skeletons/empty columns. That's an accepted current limitation, not a per-story bug.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ProspectsBoard>;

export const Default: Story = {};
