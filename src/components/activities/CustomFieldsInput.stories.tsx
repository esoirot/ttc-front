import type { Meta, StoryObj } from "@storybook/react-vite";
import { CustomFieldsInput } from "./CustomFieldsInput";

const meta: Meta<typeof CustomFieldsInput> = {
  component: CustomFieldsInput,
  title: "Molecules/CustomFieldsInput",
  args: {
    fields: [
      { key: "Portal", value: "SDL Trados" },
      { key: "PO number", value: "PO-4821" },
    ],
    onAdd: () => {},
    onUpdate: () => {},
    onRemove: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof CustomFieldsInput>;

export const Default: Story = {};

export const Empty: Story = { args: { fields: [] } };

export const SingleField: Story = {
  args: { fields: [{ key: "CAT tool", value: "memoQ" }] },
};
