import type { Meta, StoryObj } from "@storybook/react-vite";
import { IntlProvider } from "react-intl";
import { MemoryRouter } from "react-router-dom";
import { messages } from "@/i18n/messages";
import type { DashboardDeadline } from "@/types/dashboard.types";
import { UpcomingDeadlines } from "./UpcomingDeadlines";

const inDays = (n: number) =>
  new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString();

const deadlines: DashboardDeadline[] = [
  {
    kind: "TASK",
    id: 3,
    title: "Chapter 1",
    deadline: inDays(-2),
    projectId: 7,
    projectTitle: "Book translation",
    taskId: 3,
    taskTitle: "Chapter 1",
  },
  {
    kind: "CHECKLIST_ITEM",
    id: 9,
    title: "Proofread glossary",
    deadline: inDays(3),
    projectId: 7,
    projectTitle: "Book translation",
    taskId: 3,
    taskTitle: "Chapter 1",
  },
  {
    kind: "PROJECT",
    id: 8,
    title: "Website localisation",
    deadline: inDays(20),
    projectId: 8,
    projectTitle: "Website localisation",
    taskId: null,
    taskTitle: null,
  },
];

const meta: Meta<typeof UpcomingDeadlines> = {
  component: UpcomingDeadlines,
  title: "Organisms/UpcomingDeadlines",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <MemoryRouter>
          <div className="max-w-md">
            <Story />
          </div>
        </MemoryRouter>
      </IntlProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof UpcomingDeadlines>;

/** One late task (red), a checklist item this week (yellow), a project later (green). */
export const Mixed: Story = { args: { deadlines } };

export const Empty: Story = { args: { deadlines: [] } };
