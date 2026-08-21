import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Project } from "@/types/projects.types";
import { ProjectsTab } from "./ProjectsTab";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    userId: 1,
    clientId: 1,
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
    useCustomRate: false,
    rateSheetId: null,
    currency: "EUR",
    deadline: null,
    startDate: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const meta: Meta<typeof ProjectsTab> = {
  component: ProjectsTab,
  title: "Organisms/ProjectsTab",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <div className="max-w-2xl">
            <Story />
          </div>
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
  args: {
    loading: false,
  },
};
export default meta;
type Story = StoryObj<typeof ProjectsTab>;

export const Default: Story = {
  args: {
    projects: [
      makeProject(),
      makeProject({ id: 2, title: "Product manual", status: "COMPLETED" }),
      makeProject({ id: 3, title: "Marketing brochure", status: "DRAFT" }),
    ],
  },
};

export const Loading: Story = { args: { projects: [], loading: true } };

export const Empty: Story = { args: { projects: [] } };

export const WithStatsAndRevenue: Story = {
  args: {
    projects: [
      makeProject({
        id: 1,
        title: "Website copy",
        useCustomRate: true,
        fixedFee: 300,
        hourlyRate: 50,
        totalTimeSeconds: 7200,
        deadline: "2026-09-15T00:00:00.000Z",
        activities: [
          { id: 1, name: "Translation", activityType: "TRANSLATOR" },
        ],
      }),
      makeProject({
        id: 2,
        title: "Product manual",
        status: "COMPLETED",
        useCustomRate: true,
        perWordRate: 0.1,
        wordCount: 5000,
        totalWordsProcessed: 5000,
        totalTimeSeconds: 3600,
        deadline: "2026-08-30T00:00:00.000Z",
        activities: [
          { id: 1, name: "Translation", activityType: "TRANSLATOR" },
          { id: 2, name: "Proofreading", activityType: "CORRECTOR" },
        ],
      }),
    ],
  },
};
