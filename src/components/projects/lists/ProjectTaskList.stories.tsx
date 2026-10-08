import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { ProjectTaskList } from "./ProjectTaskList";

const meta: Meta<typeof ProjectTaskList> = {
  component: ProjectTaskList,
  title: "Organisms/ProjectTaskList",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <Story />
        </IntlProvider>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "No backend/MSW mocking is configured yet — useProjectTaskList's underlying useTasks query fires for real and fails fast in Storybook's sandbox, so this settles into an empty/loading state. That's an accepted current limitation, not a per-story bug.",
      },
    },
  },
  args: {
    projectId: 1,
    onOpenModal: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof ProjectTaskList>;

export const Default: Story = {};
