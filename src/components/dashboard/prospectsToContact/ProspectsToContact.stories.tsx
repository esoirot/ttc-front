import type { Meta, StoryObj } from "@storybook/react-vite";
import { IntlProvider } from "react-intl";
import { MemoryRouter } from "react-router-dom";
import { messages } from "@/i18n/messages";
import type { DashboardProspect } from "@/types/dashboard.types";
import { ProspectsToContact } from "./ProspectsToContact";

const inDays = (n: number) =>
  new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString();

const prospects: DashboardProspect[] = [
  {
    id: 1,
    name: "New lead",
    status: "TO_CONTACT",
    contactedAt: null,
    dueAt: null,
  },
  {
    id: 2,
    name: "Globex",
    status: "FOLLOW_UP_1",
    contactedAt: inDays(-20),
    dueAt: inDays(-6),
  },
  {
    id: 3,
    name: "Initech",
    status: "CONTACTED",
    contactedAt: inDays(-10),
    dueAt: inDays(4),
  },
  {
    id: 4,
    name: "Umbrella",
    status: "FOLLOW_UP_2",
    contactedAt: inDays(0),
    dueAt: inDays(14),
  },
];

const meta: Meta<typeof ProspectsToContact> = {
  component: ProspectsToContact,
  title: "Organisms/ProspectsToContact",
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
type Story = StoryObj<typeof ProspectsToContact>;

/** Contact now and overdue (red), due this week (yellow), due later (green). */
export const Mixed: Story = { args: { prospects } };

export const Empty: Story = { args: { prospects: [] } };
