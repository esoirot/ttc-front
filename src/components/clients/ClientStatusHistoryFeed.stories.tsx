import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ClientStatusHistory } from "@/types/clients.types";
import { ClientStatusHistoryFeed } from "./ClientStatusHistoryFeed";

const history: ClientStatusHistory[] = [
  {
    id: 1,
    clientId: 1,
    userId: 1,
    type: "STATUS_CHANGED",
    payload: JSON.stringify({ from: "TO_CONTACT", to: "CONTACTED" }),
    createdAt: "2026-06-01T09:00:00.000Z",
    user: { id: 1, name: "Ada Lovelace" },
  },
  {
    id: 2,
    clientId: 1,
    userId: 1,
    type: "CONTACTED_AT_CHANGED",
    payload: JSON.stringify({ from: null, to: "2026-06-05T00:00:00.000Z" }),
    createdAt: "2026-06-05T10:00:00.000Z",
    user: { id: 1, name: "Ada Lovelace" },
  },
  {
    id: 3,
    clientId: 1,
    userId: 1,
    type: "STATUS_CHANGED",
    payload: JSON.stringify({ from: "FOLLOW_UP_3", to: "RECONTACT_LATER" }),
    createdAt: "2026-06-26T05:00:00.000Z",
    user: null,
  },
];

const meta: Meta<typeof ClientStatusHistoryFeed> = {
  component: ClientStatusHistoryFeed,
  title: "Molecules/ClientStatusHistoryFeed",
  args: { history },
};
export default meta;
type Story = StoryObj<typeof ClientStatusHistoryFeed>;

export const Default: Story = {};

export const Empty: Story = { args: { history: [] } };
