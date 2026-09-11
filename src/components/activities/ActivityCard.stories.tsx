import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
import type { AnyActivity } from "@/types/activities.types";
import { ActivityCard } from "./ActivityCard";

function makeActivity(overrides: Partial<AnyActivity> = {}): AnyActivity {
  return {
    id: 1,
    userId: 1,
    name: "Freelance",
    activityType: "CUSTOM",
    companyName: null,
    legalForm: null,
    charges: [],
    translationRates: [],
    customFields: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as AnyActivity;
}

const meta: Meta<typeof ActivityCard> = {
  component: ActivityCard,
  title: "Organisms/ActivityCard",
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={messages.en}>
        <MemoryRouter initialEntries={["/activities"]}>
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
type Story = StoryObj<typeof ActivityCard>;

export const Default: Story = { args: { activity: makeActivity() } };

export const Translator: Story = {
  args: {
    activity: makeActivity({
      id: 2,
      name: "Agency work",
      activityType: "TRANSLATOR",
      companyName: "Acme SARL",
      legalForm: "SARL",
    }),
  },
};

export const WithoutCompanyInfo: Story = {
  args: {
    activity: makeActivity({
      id: 3,
      name: "Side gig",
      activityType: "CORRECTOR",
    }),
  },
};
