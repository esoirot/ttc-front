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
  totalWordsProcessed?: number | null;
  activities?: { id: number; name: string; activityType: string }[];
  createdAt: string;
  updatedAt: string;
};

const TRANSLATION_ACTIVITY = {
  id: 1,
  name: "Translation",
  activityType: "TRANSLATOR",
};
const CORRECTOR_ACTIVITY = {
  id: 2,
  name: "Proofreading",
  activityType: "CORRECTOR",
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
    totalWordsProcessed: null,
    activities: [],
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
type MockClient = {
  id: number;
  name: string;
  activities?: { id: number; name: string; activityType: string }[];
};

async function mockProjectsApi(
  page: Page,
  initial: MockProject[],
  clients: MockClient[] = [],
) {
  let projects = initial.map((p) => ({ ...p }));
  let nextProjectId = projects.reduce((max, p) => Math.max(max, p.id), 0) + 1;

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
      return respond({
        clients: { items: clients, nextCursor: null, total: clients.length },
      });
    }

    if (operationName === "MyActivities") {
      return respond({
        myActivities: [TRANSLATION_ACTIVITY, CORRECTOR_ACTIVITY],
      });
    }

    if (operationName === "CreateProject") {
      const input = (variables?.["input"] ?? {}) as Partial<MockProject> & {
        clientId?: number | null;
      };
      const client = clients.find((c) => c.id === input.clientId);
      const created = makeProject({
        id: nextProjectId++,
        title: input.title ?? "New project",
        clientId: input.clientId ?? null,
        sourceLanguage: input.sourceLanguage ?? null,
        targetLanguage: input.targetLanguage ?? null,
        // Simulates the backend's "inherit client's activities on create"
        // rule (ProjectsService.create) — the create form never sends
        // activityIds itself, so the mock always inherits here.
        activities: client?.activities ?? [],
      });
      projects = [...projects, created];
      return respond({ createProject: created });
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

test("creating a project for a client with activities inherits that client's activities", async ({
  page,
}) => {
  await mockProjectsApi(
    page,
    [],
    [{ id: 5, name: "Acme Corp", activities: [TRANSLATION_ACTIVITY] }],
  );
  await page.goto("/projects");

  await page.getByRole("button", { name: "New project" }).click();
  await page.getByLabel("Title *").fill("Website copy");
  await page.getByLabel("Client").click();
  await page.getByRole("option", { name: "Acme Corp" }).click();
  await page.getByRole("button", { name: "Create project" }).click();

  await expect(page.getByText("Website copy")).toBeVisible();
  await page.getByText("Website copy").click();
  await page.getByRole("button", { name: "Edit" }).click();

  await expect(page.getByText("Translation")).toBeVisible();
});

test("project word count shows as SUM / TOTAL from totalWordsProcessed and wordCount", async ({
  page,
}) => {
  await mockProjectsApi(page, [
    makeProject({
      id: 8,
      title: "Translate manual",
      wordCount: 2500,
      totalWordsProcessed: 1200,
    }),
  ]);
  await page.goto("/projects/8");

  await expect(page.getByText("1,200 / 2,500 words")).toBeVisible();
});
