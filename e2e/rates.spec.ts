import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { MOCK_USER } from "./helpers/mock";

type MockRate = {
  id: number;
  userId: number;
  activityId: number | null;
  clientId: number | null;
  type: string;
  name: string;
  amount: number;
  currency: string;
  description: string | null;
  sourceLanguage: string | null;
  targetLanguage: string | null;
};

const NOW = "2026-01-01T00:00:00.000Z";

const ACTIVITY_STUB = {
  __typename: "TranslatorActivity",
  id: 10,
  userId: 1,
  name: "Translation Biz",
  activityType: "TRANSLATOR",
  companyName: null,
  legalForm: null,
  professionalEmail: null,
  professionalPhone: null,
  website: null,
  timezone: null,
  objectiveQ1: null,
  objectiveQ2: null,
  objectiveQ3: null,
  objectiveQ4: null,
  charges: [] as unknown[],
  createdAt: NOW,
  updatedAt: NOW,
  languagePairs: [] as unknown[],
};

function makeRate(overrides: Partial<MockRate> = {}): MockRate {
  return {
    id: 1,
    userId: 1,
    activityId: null,
    clientId: null,
    type: "HOURLY",
    name: "Standard",
    amount: 40,
    currency: "EUR",
    description: null,
    sourceLanguage: null,
    targetLanguage: null,
    ...overrides,
  };
}

// Mocks /graphql for the Rates + Activity Rates-section flows: TranslationRate
// CRUD backed by one mutable array, shared by both the /rates index page and
// the /activities/:id page's embedded `activity.translationRates` — so a
// mutation made on one page is visible from the other via the real
// GraphQL response shape, not a canned static fixture.
async function mockRatesApi(page: Page, initialRates: MockRate[]) {
  let rates = initialRates.map((r) => ({ ...r }));
  let nextId = rates.reduce((max, r) => Math.max(max, r.id), 0) + 1;

  await page.route("**/graphql", async (route) => {
    const body = route.request().postDataJSON() as {
      operationName: string;
      variables?: Record<string, unknown>;
    };
    const { operationName, variables } = body;
    const respond = (data: unknown) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data }),
      });

    if (operationName === "Me") {
      return respond({ me: MOCK_USER });
    }

    if (operationName === "MyActivities") {
      return respond({
        myActivities: [{ ...ACTIVITY_STUB, translationRates: [] }],
      });
    }

    if (operationName === "Activity") {
      const id = variables?.["id"] as number;
      return respond({
        activity: {
          ...ACTIVITY_STUB,
          id,
          translationRates: rates.filter((r) => r.activityId === id),
        },
      });
    }

    if (operationName === "TranslationRates") {
      const type = variables?.["type"] as string | undefined;
      const items = rates.filter((r) => !type || r.type === type);
      return respond({ translationRates: items });
    }

    if (operationName === "RateSheets") {
      return respond({ rateSheets: [] });
    }

    if (operationName === "Clients") {
      return respond({ clients: { items: [], nextCursor: null, total: 0 } });
    }

    if (operationName === "Tags") {
      return respond({ tags: [] });
    }

    if (operationName === "CreateTranslationRate") {
      const input = (variables?.["input"] ?? {}) as Partial<MockRate>;
      const created = makeRate({ ...input, id: nextId++ });
      rates = [...rates, created];
      return respond({ createTranslationRate: created });
    }

    if (operationName === "UpdateTranslationRate") {
      const input = variables?.["input"] as
        (Partial<MockRate> & { id: number }) | undefined;
      rates = rates.map((r) => (r.id === input?.id ? { ...r, ...input } : r));
      const updated = rates.find((r) => r.id === input?.id);
      return respond({ updateTranslationRate: updated });
    }

    return respond(null);
  });
}

test("ActivityDetail: adding a Rate auto-scopes to the current Translator activity and shows the language pair chip", async ({
  page,
}) => {
  await mockRatesApi(page, []);
  await page.goto("/activities/10");

  await page.getByRole("button", { name: "+ Add Rate" }).click();
  await page.getByLabel("Name", { exact: true }).fill("Legal EN-FR");
  await page.getByLabel("Source language").click();
  await page.getByRole("option", { name: "EN — English" }).click();
  await page.getByLabel("Target language").click();
  await page.getByRole("option", { name: "FR — French" }).click();
  await page.getByLabel("Amount (/hr)", { exact: true }).fill("45");
  await page.getByRole("button", { name: "Add Rate" }).click();

  await expect(page.getByText("Legal EN-FR")).toBeVisible();
  await expect(page.getByText("EN → FR")).toBeVisible();
});

test("editing a rate's amount on the Rates index page is reflected on the Activity page without a hard refresh", async ({
  page,
}) => {
  await mockRatesApi(page, [
    makeRate({
      id: 501,
      activityId: 10,
      amount: 40,
      sourceLanguage: "EN",
      targetLanguage: "FR",
    }),
  ]);

  await page.goto("/activities/10");
  await expect(page.getByText("40.00 €")).toBeVisible();

  await page.getByRole("link", { name: "Rates" }).click();
  await expect(page).toHaveURL("/rates");
  await page.getByRole("tab", { name: "Hourly" }).click();
  await expect(page.getByText("40.00 €")).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Amount (/hr)").fill("55");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("55.00 €")).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL("/activities/10");
  await expect(page.getByText("55.00 €")).toBeVisible();
});
