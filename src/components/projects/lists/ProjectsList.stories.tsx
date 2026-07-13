import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { ProjectsList } from "./ProjectsList";

const meta: Meta<typeof ProjectsList> = {
  component: ProjectsList,
  title: "Organisms/ProjectsList",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/projects"]}>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "No backend/MSW mocking is configured yet — useProjects/useClients fire for real and fail fast in Storybook's sandbox, so this settles into an empty/loading state. That's an accepted current limitation, not a per-story bug.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ProjectsList>;

export const Default: Story = {};
