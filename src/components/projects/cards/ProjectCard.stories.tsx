import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Project } from "@/types/projects.types";
import { ProjectCard } from "./ProjectCard";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    userId: 1,
    clientId: 1,
    title: "Website copy",
    description: null,
    status: "ACTIVE",
    sourceLanguage: "EN",
    targetLanguage: "FR",
    wordCount: 2400,
    unitPrice: null,
    fixedFee: null,
    hourlyRate: null,
    perWordRate: null,
    currency: "EUR",
    deadline: "2026-08-01T00:00:00.000Z",
    startDate: null,
    totalTimeSeconds: 5400,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const meta: Meta<typeof ProjectCard> = {
  component: ProjectCard,
  title: "Organisms/ProjectCard",
  args: {
    project: makeProject(),
    clientName: "Acme Corp",
    onDelete: () => {},
    onClick: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof ProjectCard>;

export const Default: Story = {};

export const NoClient: Story = {
  args: {
    project: makeProject({ clientId: null }),
    clientName: undefined,
  },
};

export const Draft: Story = {
  args: {
    project: makeProject({
      status: "DRAFT",
      totalTimeSeconds: 0,
      deadline: null,
    }),
  },
};

export const InvoicePaid: Story = {
  args: {
    project: makeProject({ status: "INVOICE_PAID" }),
  },
};
