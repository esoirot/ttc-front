import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import type { Project } from "@/types/projects.types";
import { ProjectHeader } from "./ProjectHeader";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    userId: 1,
    clientId: 1,
    title: "Translate manual",
    description: "Technical manual translation, 40 pages.",
    status: "ACTIVE",
    sourceLanguage: "EN",
    targetLanguage: "FR",
    wordCount: 12000,
    unitPrice: null,
    fixedFee: null,
    hourlyRate: 45,
    perWordRate: null,
    useCustomRate: false,
    rateSheetId: null,
    currency: "EUR",
    deadline: "2026-08-15T00:00:00.000Z",
    startDate: "2026-07-01T00:00:00.000Z",
    totalWordsProcessed: 4500,
    activities: [{ id: 1, name: "Translation", activityType: "TRANSLATOR" }],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const meta: Meta<typeof ProjectHeader> = {
  component: ProjectHeader,
  title: "Organisms/ProjectHeader",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <MemoryRouter>
            <Story />
          </MemoryRouter>
        </IntlProvider>
      </QueryClientProvider>
    ),
  ],
  args: {
    project: makeProject(),
    onUpdate: () => Promise.resolve(),
    saving: false,
  },
};
export default meta;
type Story = StoryObj<typeof ProjectHeader>;

export const Default: Story = {};

export const NoClient: Story = {
  args: {
    project: makeProject({ clientId: null, hourlyRate: null }),
  },
};

export const Saving: Story = {
  args: { saving: true },
};
