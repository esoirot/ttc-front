import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProjectSelect } from "./ProjectSelect";
import type { ClockifyProject } from "@/types/clockify.types";

const projects: ClockifyProject[] = [
  {
    id: "p1",
    name: "Website Redesign",
    color: "#e11d48",
    archived: false,
    clientId: "c1",
  },
  {
    id: "p2",
    name: "Mobile App",
    color: "#2563eb",
    archived: false,
    clientId: "c2",
  },
  {
    id: "p3",
    name: "Internal Tools",
    color: "#16a34a",
    archived: false,
    clientId: null,
  },
];

const meta: Meta<typeof ProjectSelect> = {
  component: ProjectSelect,
  title: "Molecules/ProjectSelect",
  args: {
    projectId: "p2",
    projects,
    onChange: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof ProjectSelect>;

export const Default: Story = {};

export const NoProjectSelected: Story = { args: { projectId: null } };

export const NoProjectsAvailable: Story = {
  args: { projectId: null, projects: [] },
};
