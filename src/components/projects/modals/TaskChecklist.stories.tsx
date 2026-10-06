import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import type { Subtask } from "@/types/tasks.types";
import { TaskChecklist } from "./TaskChecklist";

function makeSubtask(overrides: Partial<Subtask> = {}): Subtask {
  return {
    id: 1,
    taskId: 4,
    checklistTitle: "Setup",
    title: "Review draft",
    done: false,
    dueDate: null,
    wordCount: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const subtasks: Subtask[] = [
  makeSubtask({
    id: 1,
    checklistTitle: "Setup",
    title: "Review draft",
    done: true,
  }),
  makeSubtask({ id: 2, checklistTitle: "Setup", title: "Send to client" }),
  makeSubtask({
    id: 3,
    checklistTitle: "Follow-up",
    title: "Confirm receipt",
    dueDate: "2026-08-01T14:30:00.000Z",
  }),
  makeSubtask({ id: 4, checklistTitle: null, title: "Miscellaneous note" }),
];

const meta: Meta<typeof TaskChecklist> = {
  component: TaskChecklist,
  title: "Organisms/TaskChecklist",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <div className="max-w-md">
            <Story />
          </div>
        </IntlProvider>
      </QueryClientProvider>
    ),
  ],
  args: {
    taskId: 4,
    subtasks,
    checklistTitles: ["Setup", "Follow-up"],
    addingChecklist: false,
    onAddingChecklistChange: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof TaskChecklist>;

export const Default: Story = {};

export const Empty: Story = {
  args: { subtasks: [], checklistTitles: [] },
};

export const AddingChecklist: Story = {
  args: { addingChecklist: true },
};
