import type { Meta, StoryObj } from "@storybook/react-vite";
import { TaskDatePicker } from "./TaskDatePicker";

const meta: Meta<typeof TaskDatePicker> = {
  component: TaskDatePicker,
  title: "Molecules/TaskDatePicker",
  args: {
    startDate: null,
    dueDate: null,
    recurring: null,
    reminderOffset: null,
    onUpdate: () => {},
    open: true,
    onOpenChange: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof TaskDatePicker>;

export const NoDate: Story = {};

export const WithDueDate: Story = {
  args: {
    startDate: "2026-07-01T09:00:00",
    dueDate: "2026-07-15T17:00:00",
  },
};

export const RecurringWithReminder: Story = {
  args: {
    startDate: "2026-07-01T09:00:00",
    dueDate: "2026-07-15T17:00:00",
    recurring: "WEEKLY",
    reminderOffset: "BEFORE_1D",
  },
};

export const Closed: Story = {
  args: { open: false },
};
