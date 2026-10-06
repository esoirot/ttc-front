import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { OccupationChips } from "./OccupationChips";
import type { AnyOccupation } from "@/types/occupations.types";

const occupations: AnyOccupation[] = [
  {
    id: 1,
    userId: 1,
    name: "Translation",
    occupationType: "TRANSLATOR",
    charges: [],
    translationRates: [],
    languagePairs: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    userId: 1,
    name: "Proofreading",
    occupationType: "CORRECTOR",
    charges: [],
    translationRates: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 3,
    userId: 1,
    name: "Consulting",
    occupationType: "CUSTOM",
    charges: [],
    translationRates: [],
    customFields: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const meta: Meta<typeof OccupationChips> = {
  component: OccupationChips,
  title: "Molecules/OccupationChips",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <Story />
      </IntlProvider>
    ),
  ],
  args: {
    occupations,
    onChange: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof OccupationChips>;

export const Empty: Story = { args: { occupationIds: [] } };

export const WithSelectedOccupations: Story = {
  args: { occupationIds: [1, 2] },
};

export const PopoverOpenWithSelections: Story = {
  render: () => {
    function Wrapper() {
      const [occupationIds, setOccupationIds] = useState([1, 2]);
      return (
        <OccupationChips
          occupationIds={occupationIds}
          occupations={occupations}
          onChange={setOccupationIds}
        />
      );
    }
    return <Wrapper />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Edit occupations" }),
    );
  },
};
