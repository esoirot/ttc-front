import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TaskSortField, TaskSortDirection } from "@/types/tasks.types";
import { TaskToolbar } from "./TaskToolbar";

function Interactive({ withStatus }: { withStatus: boolean }) {
  const [dueFrom, setDueFrom] = useState("");
  const [dueTo, setDueTo] = useState("");
  const [field, setField] = useState<TaskSortField>("dueDate");
  const [direction, setDirection] = useState<TaskSortDirection>("desc");
  return (
    <TaskToolbar
      idPrefix="story"
      dueFrom={dueFrom}
      dueTo={dueTo}
      onDueFromChange={setDueFrom}
      onDueToChange={setDueTo}
      sortField={field}
      sortDirection={direction}
      onSortFieldChange={setField}
      onSortDirectionChange={setDirection}
      onNewTask={() => {}}
    >
      {withStatus && (
        <>
          <Label
            htmlFor="story-status"
            className="text-xs text-muted-foreground"
          >
            Status
          </Label>
          <Select defaultValue="ALL">
            <SelectTrigger id="story-status" className="w-full sm:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="TODO">To do</SelectItem>
            </SelectContent>
          </Select>
        </>
      )}
    </TaskToolbar>
  );
}

const meta: Meta<typeof TaskToolbar> = {
  component: TaskToolbar,
  title: "Molecules/TaskToolbar",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <Story />
      </IntlProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof TaskToolbar>;

export const WithStatusFilter: Story = {
  render: () => <Interactive withStatus />,
};

export const KanbanVariant: Story = {
  render: () => <Interactive withStatus={false} />,
};

export const Mobile: Story = {
  render: () => <Interactive withStatus />,
  globals: { viewport: { value: "mobile1" } },
};
