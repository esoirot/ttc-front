import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { MOCK_USER } from "./helpers/mock";

const NOW = "2026-01-01T00:00:00.000Z";

type MockProject = {
  id: number;
  userId: number;
  clientId: number | null;
  title: string;
  description: string | null;
  status: string;
  sourceLanguage: string | null;
  targetLanguage: string | null;
  wordCount: number | null;
  unitPrice: number | null;
  fixedFee: number | null;
  hourlyRate: number | null;
  perWordRate: number | null;
  useCustomRate: boolean;
  rateSheetId: number | null;
  currency: string;
  deadline: string | null;
  startDate: string | null;
  totalTimeSeconds: number;
  createdAt: string;
  updatedAt: string;
};

function makeProject(overrides: Partial<MockProject> = {}): MockProject {
  return {
    id: 1,
    userId: 1,
    clientId: null,
    title: "Translate manual",
    description: null,
    status: "ACTIVE",
    sourceLanguage: null,
    targetLanguage: null,
    wordCount: null,
    unitPrice: null,
    fixedFee: null,
    hourlyRate: null,
    perWordRate: null,
    useCustomRate: false,
    rateSheetId: null,
    currency: "EUR",
    deadline: null,
    startDate: null,
    totalTimeSeconds: 0,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

// Mocks /graphql for the ProjectDetail page: the header's edit form alone
// pulls in Clients, TranslationRates and RateSheets (for the rate picker),
// while the page shell around it fires Tasks/TimeEntries/ActiveTimer/Tags/
// Members — all stubbed to empty so the page renders past loading without
// touching anything this test doesn't care about.
async function mockProjectsApi(page: Page, initial: MockProject[]) {
  let projects = initial.map((p) => ({ ...p }));

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

    if (operationName === "Project") {
      const id = variables?.["id"] as number;
      return respond({ project: projects.find((p) => p.id === id) ?? null });
    }

    if (operationName === "Projects") {
      return respond({
        projects: { items: projects, nextCursor: null, total: projects.length },
      });
    }

    if (operationName === "UpdateProject") {
      const input = variables?.["input"] as
        (Partial<MockProject> & { id: number }) | undefined;
      projects = projects.map((p) =>
        p.id === input?.id ? { ...p, ...input } : p,
      );
      const updated = projects.find((p) => p.id === input?.id);
      return respond({ updateProject: updated });
    }

    if (operationName === "Clients") {
      return respond({ clients: { items: [], nextCursor: null, total: 0 } });
    }

    if (operationName === "TranslationRates") {
      return respond({ translationRates: [] });
    }

    if (operationName === "RateSheets") {
      return respond({ rateSheets: [] });
    }

    if (operationName === "Tasks") {
      return respond({ tasks: { items: [], nextCursor: null, total: 0 } });
    }

    if (operationName === "TimeEntries") {
      return respond({
        timeEntries: { items: [], nextCursor: null, total: 0 },
      });
    }

    if (operationName === "ActiveTimer") {
      return respond({ activeTimer: null });
    }

    if (operationName === "Tags") {
      return respond({ tags: [] });
    }

    if (operationName === "Members") {
      return respond({ members: [] });
    }

    return respond(null);
  });
}

test("ProjectHeader Edit -> change the title -> Save persists the new value", async ({
  page,
}) => {
  await mockProjectsApi(page, [
    makeProject({ id: 7, title: "Translate manual" }),
  ]);
  await page.goto("/projects/7");

  await expect(page.getByText("Translate manual")).toBeVisible();
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Title", { exact: true }).fill("Translate handbook");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText("Translate handbook")).toBeVisible();
});
