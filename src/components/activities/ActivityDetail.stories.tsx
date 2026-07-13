import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ActivityDetail } from "./ActivityDetail";

const meta: Meta<typeof ActivityDetail> = {
  component: ActivityDetail,
  title: "Organisms/ActivityDetail",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={["/activities/5"]}>
          <Routes>
            <Route path="/activities/:id" element={<Story />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "The biggest Organism in this batch — owns `useActivity`, `useCreateRate`, `useDeleteRate`, `useRateSheets`, `useDeleteRateSheet` and composes ChargeRow/AddChargeForm/ObjectivesForm/ActivityInfoForm/TagsSection/LanguagePairsSection/RateForm, each of which owns its own query/mutation hooks. No backend/MSW mocking is configured yet — every one of those queries fires for real and fails fast in Storybook's sandbox, so this story settles into the 'Activity not found.' state. That's an accepted limitation, not a bug.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ActivityDetail>;

export const Default: Story = {};
