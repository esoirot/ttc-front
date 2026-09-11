import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { ProjectDetail } from "./ProjectDetail";

const meta: Meta<typeof ProjectDetail> = {
  component: ProjectDetail,
  title: "Organisms/ProjectDetail",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <QueryClientProvider client={new QueryClient()}>
          <MemoryRouter initialEntries={["/projects/1"]}>
            <Routes>
              <Route path="/projects/:id" element={<Story />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </IntlProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "No backend/MSW mocking is configured yet — useProject and its sibling hooks (useUpdateProject, useTasks, useProjectTimeTab, useMembers, useClients, useCurrentUser) fire for real and fail fast in Storybook's sandbox, so this settles into the 'Project not found.' state. That's an accepted current limitation, not a per-story bug.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ProjectDetail>;

export const Default: Story = {};
