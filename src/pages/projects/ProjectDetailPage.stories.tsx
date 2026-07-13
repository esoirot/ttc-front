import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProjectDetailPage } from "./ProjectDetailPage";

const meta: Meta<typeof ProjectDetailPage> = {
  component: ProjectDetailPage,
  title: "Pages/ProjectDetailPage",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/projects/1"]}>
          <Routes>
            <Route path="/projects/:id" element={<Story />} />
          </Routes>
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
type Story = StoryObj<typeof ProjectDetailPage>;

export const Default: Story = {};
