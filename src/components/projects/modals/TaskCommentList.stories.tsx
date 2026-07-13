import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { TaskComment } from "@/types/tasks.types";
import { TaskCommentList } from "./TaskCommentList";

function makeComment(overrides: Partial<TaskComment> = {}): TaskComment {
  return {
    id: 1,
    taskId: 4,
    authorId: 1,
    body: "Looks good",
    createdAt: "2026-06-17T11:00:00.000Z",
    updatedAt: "2026-06-17T11:00:00.000Z",
    ...overrides,
  };
}

const comments: TaskComment[] = [
  makeComment({ id: 1, authorId: 1, body: "Draft is ready for review." }),
  makeComment({
    id: 2,
    authorId: 9,
    body: "Thanks, will check it this afternoon.",
    createdAt: "2026-06-17T12:15:00.000Z",
    updatedAt: "2026-06-17T12:15:00.000Z",
  }),
];

const meta: Meta<typeof TaskCommentList> = {
  component: TaskCommentList,
  title: "Organisms/TaskCommentList",
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
    comments,
    currentUserId: 1,
  },
};
export default meta;
type Story = StoryObj<typeof TaskCommentList>;

export const Default: Story = {};

export const Empty: Story = {
  args: { comments: [] },
};

export const NoCurrentUser: Story = {
  args: { currentUserId: undefined },
};
