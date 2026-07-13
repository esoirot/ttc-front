import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TaskTimeSection } from "./TaskTimeSection";

const meta: Meta<typeof TaskTimeSection> = {
  component: TaskTimeSection,
  title: "Organisms/TaskTimeSection",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <div className="max-w-sm border border-border rounded-md p-4">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  args: {
    taskId: 4,
    projectId: 1,
    taskTitle: "Translate homepage copy",
  },
};
export default meta;
type Story = StoryObj<typeof TaskTimeSection>;

// TaskTimeSection owns every data hook it needs (useTask, useTimeEntries,
// useActiveTimer, useProjects, useTags, ...) — no MSW backend is configured
// in Storybook, so these ungated queries fall into their loading/error state
// here, per the taxonomy note on components with ungated queries on mount.
export const Default: Story = {};
