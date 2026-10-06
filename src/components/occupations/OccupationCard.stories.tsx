import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import type { AnyOccupation } from "@/types/occupations.types";
import { OccupationCard } from "./OccupationCard";

function makeOccupation(overrides: Partial<AnyOccupation> = {}): AnyOccupation {
  return {
    id: 1,
    userId: 1,
    name: "Freelance",
    occupationType: "CUSTOM",
    companyName: null,
    legalForm: null,
    charges: [],
    translationRates: [],
    customFields: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as AnyOccupation;
}

const meta: Meta<typeof OccupationCard> = {
  component: OccupationCard,
  title: "Organisms/OccupationCard",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <MemoryRouter initialEntries={["/occupations"]}>
          <div className="max-w-md">
            <Story />
          </div>
        </MemoryRouter>
      </IntlProvider>
    ),
  ],
  args: {
    onDelete: () => {},
  },
};
export default meta;
type Story = StoryObj<typeof OccupationCard>;

export const Default: Story = { args: { occupation: makeOccupation() } };

export const Translator: Story = {
  args: {
    occupation: makeOccupation({
      id: 2,
      name: "Agency work",
      occupationType: "TRANSLATOR",
      companyName: "Acme SARL",
      legalForm: "SARL",
    }),
  },
};

export const WithoutCompanyInfo: Story = {
  args: {
    occupation: makeOccupation({
      id: 3,
      name: "Side gig",
      occupationType: "CORRECTOR",
    }),
  },
};
