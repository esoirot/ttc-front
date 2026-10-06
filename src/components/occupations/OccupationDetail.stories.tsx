import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import { OccupationDetail } from "./OccupationDetail";

const meta: Meta<typeof OccupationDetail> = {
  component: OccupationDetail,
  title: "Organisms/OccupationDetail",
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <IntlProvider locale="en" messages={messages.en}>
          <MemoryRouter initialEntries={["/occupations/5"]}>
            <Routes>
              <Route path="/occupations/:id" element={<Story />} />
            </Routes>
          </MemoryRouter>
        </IntlProvider>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "The biggest Organism in this batch — owns `useOccupation`, `useCreateRate`, `useDeleteRate`, `useRateSheets`, `useDeleteRateSheet` and composes ChargeRow/AddChargeForm/ObjectivesForm/OccupationInfoForm/TagsSection/LanguagePairsSection/RateForm, each of which owns its own query/mutation hooks. No backend/MSW mocking is configured yet — every one of those queries fires for real and fails fast in Storybook's sandbox, so this story settles into the 'Occupation not found.' state. That's an accepted limitation, not a bug.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof OccupationDetail>;

export const Default: Story = {};
