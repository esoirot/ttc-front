import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { ProjectsOverviewCharts } from "./ProjectsOverviewCharts";

const meta: Meta<typeof ProjectsOverviewCharts> = {
  component: ProjectsOverviewCharts,
  title: "Organisms/ProjectsOverviewCharts",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <Story />
        </IntlProvider>
      </QueryClientProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ProjectsOverviewCharts>;

export const Default: Story = {};
