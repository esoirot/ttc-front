import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { ActivityChips } from "./ActivityChips";
import type { AnyActivity } from "@/types/activities.types";

const activities: AnyActivity[] = [
  {
    id: 1,
    userId: 1,
    name: "Translation",
    activityType: "TRANSLATOR",
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
    activityType: "CORRECTOR",
    charges: [],
    translationRates: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 3,
    userId: 1,
    name: "Consulting",
    activityType: "CUSTOM",
    charges: [],
    translationRates: [],
    customFields: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const meta: Meta<typeof ActivityChips> = {
  component: ActivityChips,
  title: "Molecules/ActivityChips",
  args: {
    activities,
    onChange: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof ActivityChips>;

export const Empty: Story = { args: { activityIds: [] } };

export const WithSelectedActivities: Story = {
  args: { activityIds: [1, 2] },
};

export const PopoverOpenWithSelections: Story = {
  render: () => {
    function Wrapper() {
      const [activityIds, setActivityIds] = useState([1, 2]);
      return (
        <ActivityChips
          activityIds={activityIds}
          activities={activities}
          onChange={setActivityIds}
        />
      );
    }
    return <Wrapper />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Edit activities" }),
    );
  },
};
