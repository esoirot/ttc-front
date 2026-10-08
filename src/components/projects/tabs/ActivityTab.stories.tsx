import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import type { TaskActivity } from "@/types/tasks.types";
import { ActivityTab } from "./ActivityTab";

function makeActivity(overrides: Partial<TaskActivity> = {}): TaskActivity {
  return {
    id: 1,
    taskId: 1,
    userId: 1,
    type: "STATUS_CHANGED",
    payload: JSON.stringify({ from: "TODO", to: "IN_PROGRESS" }),
    createdAt: "2026-06-01T10:00:00.000Z",
    user: { id: 1, name: "Alice" },
    task: { id: 1, title: "Translate homepage" },
    ...overrides,
  };
}

// Newest first, as projectActivities returns them.
const activities: TaskActivity[] = [
  makeActivity({
    id: 3,
    taskId: 2,
    type: "COMMENT_ADDED",
    payload: null,
    createdAt: "2026-06-02T09:00:00.000Z",
    task: { id: 2, title: "Proofread footer" },
  }),
  makeActivity({ id: 2, createdAt: "2026-06-01T10:00:00.000Z" }),
  makeActivity({
    id: 1,
    type: "CREATED",
    payload: null,
    createdAt: "2026-06-01T09:00:00.000Z",
  }),
];

/** A query client already holding the project's first page of activity. */
function seeded(items: TaskActivity[], nextCursor: number | null = null) {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  });
  client.setQueryData(["projectActivities", 1], {
    pages: [{ items, nextCursor, total: items.length }],
    pageParams: [undefined],
  });
  return client;
}

const meta: Meta<typeof ActivityTab> = {
  component: ActivityTab,
  title: "Organisms/ProjectActivityTab",
  args: { projectId: 1 },
};
export default meta;
type Story = StoryObj<typeof ActivityTab>;

const withActivity =
  (client: QueryClient) => (Story: () => React.JSX.Element) => (
    <QueryClientProvider client={client}>
      <IntlProvider locale="en" messages={messages.en}>
        <div className="max-w-2xl">
          <Story />
        </div>
      </IntlProvider>
    </QueryClientProvider>
  );

export const Default: Story = {
  decorators: [withActivity(seeded(activities))],
};

export const WithOlderActivity: Story = {
  decorators: [withActivity(seeded(activities, 1))],
};

export const Empty: Story = {
  decorators: [withActivity(seeded([]))],
};
