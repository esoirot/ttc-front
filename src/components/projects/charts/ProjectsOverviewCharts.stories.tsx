import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProjectsOverviewCharts } from "./ProjectsOverviewCharts";

const meta: Meta<typeof ProjectsOverviewCharts> = {
  component: ProjectsOverviewCharts,
  title: "Organisms/ProjectsOverviewCharts",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ProjectsOverviewCharts>;

export const Default: Story = {};
