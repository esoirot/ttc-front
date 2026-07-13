import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Project } from "@/types/projects.types";
import type { Tag } from "@/types/tags.types";
import { TimerStartInput } from "./TimerStartInput";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    userId: 1,
    clientId: null,
    title: "Website copy",
    description: null,
    status: "ACTIVE",
    sourceLanguage: null,
    targetLanguage: null,
    wordCount: null,
    unitPrice: null,
    fixedFee: null,
    hourlyRate: null,
    perWordRate: null,
    currency: "EUR",
    startDate: null,
    deadline: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as Project;
}

const projects: Project[] = [
  makeProject({ id: 1, title: "Website copy" }),
  makeProject({ id: 2, title: "Manual translation" }),
];

const tags: Tag[] = [
  { id: 1, name: "Urgent" },
  { id: 2, name: "Client review" },
];

const recentDescriptions = ["Translation", "Proofreading", "Editing"];

const meta: Meta<typeof TimerStartInput> = {
  component: TimerStartInput,
  title: "Molecules/TimerStartInput",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  args: {
    projects,
    tags,
    recentDescriptions,
  },
};
export default meta;
type Story = StoryObj<typeof TimerStartInput>;

export const Default: Story = {};

export const NoProjects: Story = {
  args: { projects: [] },
};

export const FromTask: Story = {
  args: {
    initialProjectId: 1,
    initialTaskId: 42,
    initialTaskTitle: "Translate homepage",
  },
};
