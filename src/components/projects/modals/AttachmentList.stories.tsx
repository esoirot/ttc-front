import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { TaskAttachment } from "@/types/tasks.types";
import { AttachmentList } from "./AttachmentList";

function makeAttachment(
  overrides: Partial<TaskAttachment> = {},
): TaskAttachment {
  return {
    id: 1,
    taskId: 4,
    type: "URL",
    fileName: null,
    url: "https://example.com/spec",
    displayText: "Spec doc",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const attachments: TaskAttachment[] = [
  makeAttachment({
    id: 1,
    type: "URL",
    url: "https://example.com/spec",
    displayText: "Spec doc",
  }),
  makeAttachment({
    id: 2,
    type: "FILE",
    fileName: "report.pdf",
    url: "/files/report.pdf",
    displayText: null,
  }),
];

const meta: Meta<typeof AttachmentList> = {
  component: AttachmentList,
  title: "Organisms/AttachmentList",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <div className="max-w-md">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  args: {
    taskId: 4,
    attachments,
    onAdd: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof AttachmentList>;

export const Default: Story = {};

export const Empty: Story = {
  args: { attachments: [] },
};

export const UrlOnly: Story = {
  args: {
    attachments: [
      makeAttachment({
        id: 1,
        type: "URL",
        url: "https://example.com/spec",
        displayText: "Spec doc",
      }),
      makeAttachment({
        id: 2,
        type: "URL",
        url: "https://example.com/no-label",
        displayText: null,
      }),
    ],
  },
};
