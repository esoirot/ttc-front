import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Project } from "@/types/projects.types";
import type { Task } from "@/types/tasks.types";
import { OverviewTab } from "./OverviewTab";

const project: Project = {
  id: 1,
  userId: 1,
  clientId: null,
  title: "Website copy",
  description: null,
  status: "ACTIVE",
  sourceLanguage: "EN",
  targetLanguage: "FR",
  wordCount: 12000,
  unitPrice: 0.12,
  fixedFee: null,
  hourlyRate: null,
  perWordRate: null,
  currency: "EUR",
  deadline: null,
  startDate: null,
  totalTimeSeconds: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 1,
    projectId: project.id,
    assigneeId: null,
    title: "Task",
    description: null,
    status: "TODO",
    dueDate: null,
    startDate: null,
    recurring: null,
    reminderOffset: null,
    sortOrder: 0,
    totalTimeSeconds: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const tasks: Task[] = [
  makeTask({ id: 1, title: "Translate homepage", totalTimeSeconds: 3600 }),
  makeTask({ id: 2, title: "Review glossary", totalTimeSeconds: 1800 }),
  makeTask({ id: 3, title: "Proofread footer", totalTimeSeconds: 900 }),
];

const meta: Meta<typeof OverviewTab> = {
  component: OverviewTab,
  title: "Organisms/OverviewTab",
  args: {
    project,
    totalSeconds: 7200,
    tasks,
  },
};
export default meta;
type Story = StoryObj<typeof OverviewTab>;

export const Default: Story = {};

export const NoTimeLogged: Story = {
  args: { totalSeconds: 0, tasks: [] },
};

export const MinimalProject: Story = {
  args: {
    project: { ...project, wordCount: null, unitPrice: null },
    tasks: [],
  },
};
