import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Member } from "@/types/users.types";
import { ProjectTaskList } from "./ProjectTaskList";

const members: Member[] = [
  { id: 1, name: "Alex Doe", email: "alex@example.com" },
  { id: 2, name: "Sam Lee", email: "sam@example.com" },
];

const meta: Meta<typeof ProjectTaskList> = {
  component: ProjectTaskList,
  title: "Organisms/ProjectTaskList",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
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
    members,
    onOpenModal: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof ProjectTaskList>;

export const Default: Story = {};
