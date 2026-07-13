import type { Meta, StoryObj } from "@storybook/react-vite";
import { TableEmptyRow } from "./AdminTableChrome";
import { Table, TableBody } from "@/components/ui/table";

const meta: Meta<typeof TableEmptyRow> = {
  component: TableEmptyRow,
  title: "Molecules/TableEmptyRow",
  args: {
    colSpan: 4,
    children: "No results found.",
  },
  decorators: [
    (Story) => (
      <Table>
        <TableBody>
          <Story />
        </TableBody>
      </Table>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof TableEmptyRow>;

export const Default: Story = {};

export const CustomMessage: Story = {
  args: {
    colSpan: 6,
    children: "No clients match your search.",
  },
};
