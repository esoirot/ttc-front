import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
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
      <MemoryRouter>
        <div className="max-w-lg">
          <Story />
        </div>
      </MemoryRouter>
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
