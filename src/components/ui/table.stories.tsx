import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./table";
import { Badge } from "./badge";

const meta: Meta<typeof Table> = {
  component: Table,
  title: "Molecules/Table",
};
export default meta;
type Story = StoryObj<typeof Table>;

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Word count</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Acme Corp</TableCell>
          <TableCell>
            <Badge>ACTIVE</Badge>
          </TableCell>
          <TableCell>1,000</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Globex</TableCell>
          <TableCell>
            <Badge variant="outline">DRAFT</Badge>
          </TableCell>
          <TableCell>500</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
