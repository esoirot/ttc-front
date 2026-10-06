import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import type { Tag } from "@/types/tags.types";
import { TimerStartInput } from "./TimerStartInput";

const tags: Tag[] = [
  { id: 1, name: "Urgent" },
  { id: 2, name: "Client review" },
];

const recentDescriptions = ["Translation", "Proofreading", "Editing"];

const meta: Meta<typeof TimerStartInput> = {
  component: TimerStartInput,
  title: "Molecules/TimerStartInput",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <Story />
        </IntlProvider>
      </QueryClientProvider>
    ),
  ],
  args: {
    tags,
    recentDescriptions,
  },
};
export default meta;
type Story = StoryObj<typeof TimerStartInput>;

export const Default: Story = {};

export const FromTask: Story = {
  args: {
    initialProjectId: 1,
    initialTaskId: 42,
    initialTaskTitle: "Translate homepage",
  },
};
