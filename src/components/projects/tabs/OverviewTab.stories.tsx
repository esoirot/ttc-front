import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import type { Project } from "@/types/projects.types";
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
  unitPrice: null,
  fixedFee: null,
  hourlyRate: null,
  perWordRate: 0.12,
  useCustomRate: false,
  rateSheetId: null,
  currency: "EUR",
  deadline: null,
  startDate: null,
  totalTimeSeconds: null,
  totalTaskWords: 4800,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const meta: Meta<typeof OverviewTab> = {
  component: OverviewTab,
  title: "Organisms/OverviewTab",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <QueryClientProvider client={new QueryClient()}>
          <Story />
        </QueryClientProvider>
      </IntlProvider>
    ),
  ],
  args: {
    project,
    totalSeconds: 7200,
  },
};
export default meta;
type Story = StoryObj<typeof OverviewTab>;

export const Default: Story = {};

export const NoTimeLogged: Story = {
  args: { totalSeconds: 0 },
};

export const MinimalProject: Story = {
  args: {
    project: { ...project, wordCount: null, perWordRate: null },
  },
};

export const WithRevenue: Story = {
  args: {
    project: {
      ...project,
      useCustomRate: true,
      fixedFee: 300,
      hourlyRate: 50,
      perWordRate: 0.1,
      occupations: [
        { id: 1, name: "Translation", occupationType: "TRANSLATOR" },
      ],
    },
    totalSeconds: 7200,
  },
};
