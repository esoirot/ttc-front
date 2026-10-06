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
  totalTaskWords?: number | null;
  occupations?: { id: number; name: string; occupationType: string }[];
  createdAt: string;
  updatedAt: string;
};

const TRANSLATION_OCCUPATION = {
  id: 1,
  name: "Translation",
  occupationType: "TRANSLATOR",
};
const CORRECTOR_OCCUPATION = {
  id: 2,
  name: "Proofreading",
  occupationType: "CORRECTOR",
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
    occupations: [],
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
  occupations?: { id: number; name: string; occupationType: string }[];
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
      // Like the backend: a title search over every client, 20 per page.
      const search = (
        variables?.["search"] as string | undefined
      )?.toLowerCase();
      const matches = search
        ? clients.filter((c) => c.name.toLowerCase().includes(search))
        : clients;
      return respond({
        clients: {
          items: matches.slice(0, 20),
          nextCursor: matches.length > 20 ? matches[19].id : null,
          total: matches.length,
        },
      });
    }

    if (operationName === "Client") {
      const id = variables?.["id"] as number;
      return respond({ client: clients.find((c) => c.id === id) ?? null });
    }

    if (operationName === "MyOccupations") {
      return respond({
        myOccupations: [TRANSLATION_OCCUPATION, CORRECTOR_OCCUPATION],
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
        // Simulates the backend's "inherit client's occupations on create"
        // rule (ProjectsService.create) — the create form never sends
        // occupationIds itself, so the mock always inherits here.
        occupations: client?.occupations ?? [],
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

    if (operationName === "FirstTimeEntryStart") {
      return respond({
        firstTimeEntryStart: "2024-03-04T09:00:00.000Z",
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

test("creating a project for a client with occupations inherits that client's occupations", async ({
  page,
}) => {
  await mockProjectsApi(
    page,
    [],
    [{ id: 5, name: "Acme Corp", occupations: [TRANSLATION_OCCUPATION] }],
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

test("the client picker finds a client past the first page by searching the server", async ({
  page,
}) => {
  const clients = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: i === 24 ? "Zeta Corp" : `Client ${i + 1}`,
    occupations: [],
  }));
  await mockProjectsApi(page, [], clients);
  await page.goto("/projects");

  await page.getByRole("button", { name: "New project" }).click();
  await page.getByLabel("Client").click();
  await expect(
    page.getByRole("option", { name: "Client 1", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("option", { name: "Zeta Corp" })).toHaveCount(0);

  await page.getByPlaceholder("Search…").fill("zeta");
  await page.getByRole("option", { name: "Zeta Corp" }).click();

  await expect(page.getByLabel("Client")).toHaveText("Zeta Corp");
});

test("the project Dashboard shows its KPIs first, then the month filter, then the charts", async ({
  page,
}) => {
  await mockProjectsApi(page, [
    makeProject({
      id: 7,
      occupations: [TRANSLATION_OCCUPATION],
      totalTaskWords: 2_500_000,
    }),
  ]);
  await page.goto("/projects/7");
  await page.getByRole("tab", { name: "Dashboard" }).click();

  const kpi = page.getByText("Task words", { exact: true });
  const filter = page.getByRole("button", { name: "Previous month" });
  const chart = page.getByText("Time per task");
  await expect(chart).toBeVisible();
  const [kpiBox, filterBox, chartBox] = await Promise.all(
    [kpi, filter, chart].map((l) => l.boundingBox()),
  );
  expect(kpiBox!.y).toBeLessThan(filterBox!.y);
  expect(filterBox!.y).toBeLessThan(chartBox!.y);

  await expect(page.getByText("2.5M", { exact: true })).toHaveAttribute(
    "title",
    "2,500,000",
  );
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

test("project total words add task and checklist words to time-entry words", async ({
  page,
}) => {
  await mockProjectsApi(page, [
    makeProject({
      id: 8,
      wordCount: 5000,
      totalWordsProcessed: 400,
      totalTaskWords: 700,
    }),
  ]);
  await page.goto("/projects/8");

  await expect(page.getByText("1,100 / 5,000 words")).toBeVisible();
  await page.getByRole("tab", { name: "Dashboard" }).click();
  await expect(page.getByText("1,100 / 5,000", { exact: true })).toBeVisible();
});

test.describe("project task toolbar on a phone", () => {
  test.use({ viewport: { width: 375, height: 800 } });

  test("Tasks tab shows the list title with New task beside it, above filters that fit the screen", async ({
    page,
  }) => {
    await mockProjectsApi(page, [makeProject({ id: 7 })]);
    await page.goto("/projects/7");
    await page.getByRole("tab", { name: "Tasks" }).click();

    const titleBox = await page
      .getByRole("heading", { name: "Task list" })
      .boundingBox();
    const newTaskBox = await page
      .getByRole("button", { name: "+ New task" })
      .boundingBox();
    const toolbarBox = await page
      .getByRole("toolbar", { name: "Task filters" })
      .boundingBox();

    // title and New task share one line, both above the filters
    expect(newTaskBox!.y).toBeLessThan(titleBox!.y + titleBox!.height);
    expect(newTaskBox!.x).toBeGreaterThan(titleBox!.x + titleBox!.width);
    expect(newTaskBox!.x + newTaskBox!.width).toBeLessThanOrEqual(375);
    expect(toolbarBox!.y).toBeGreaterThanOrEqual(
      newTaskBox!.y + newTaskBox!.height,
    );
    expect(toolbarBox!.x + toolbarBox!.width).toBeLessThanOrEqual(375);
  });

  test("Kanban board scrolls horizontally inside its own container", async ({
    page,
  }) => {
    await mockProjectsApi(page, [makeProject({ id: 7 })]);
    await page.goto("/projects/7");
    await page.getByRole("tab", { name: "Kanban" }).click();

    const board = page.getByRole("region", { name: "Kanban board" });
    const boardBox = await board.boundingBox();
    expect(boardBox!.x + boardBox!.width).toBeLessThanOrEqual(375);
    const overflows = await board.evaluate(
      (el) => el.scrollWidth > el.clientWidth,
    );
    expect(overflows).toBe(true);
  });
});

test("projects page shows the list by default and the charts in the Dashboard tab", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date(2026, 9, 15, 10, 0));
  await mockProjectsApi(page, [
    makeProject({ id: 7, title: "Translate manual" }),
  ]);
  await page.goto("/projects");

  await expect(page.getByText("Translate manual")).toBeVisible();
  await expect(page.getByText("Time per project")).toHaveCount(0);

  await page.getByRole("tab", { name: "Dashboard" }).click();

  await expect(page.getByText("Time per project")).toHaveCount(2);
  await expect(page.getByText("Words per project")).toHaveCount(2);
  await expect(page.getByText("Translate manual")).toHaveCount(0);
});

test("the Dashboard month filter loads the selected month's time entries", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date(2026, 9, 15, 10, 0));
  await mockProjectsApi(page, []);
  const timeEntryRanges: Record<string, unknown>[] = [];
  page.on("request", (req) => {
    if (!req.url().includes("/graphql") || req.method() !== "POST") return;
    const body = req.postDataJSON() as {
      operationName: string;
      variables?: Record<string, unknown>;
    };
    if (body.operationName === "TimeEntries" && body.variables) {
      timeEntryRanges.push(body.variables);
    }
  });
  await page.goto("/projects");
  await page.getByRole("tab", { name: "Dashboard" }).click();

  await expect(page.getByRole("combobox", { name: "Month" })).toHaveText(
    "October",
  );
  await expect(page.getByRole("combobox", { name: "Year" })).toHaveText("2026");
  await expect(page.getByRole("button", { name: "Next month" })).toBeDisabled();

  await page.getByRole("button", { name: "Previous month" }).click();

  await expect(page.getByRole("combobox", { name: "Month" })).toHaveText(
    "September",
  );
  // the two monthly chart subtitles
  await expect(page.getByText("September 2026", { exact: true })).toHaveCount(
    2,
  );
  await expect(
    page.getByText("No time logged in September 2026."),
  ).toBeVisible();
  const september = await page.evaluate(() => ({
    start: new Date(2026, 8, 1).toISOString(),
    end: new Date(2026, 8, 30, 23, 59, 59, 999).toISOString(),
  }));
  await expect
    .poll(() => timeEntryRanges)
    .toContainEqual({ ...september, pagination: { limit: 1000 } });
});

test("the Dashboard month and year pickers jump to any month since the first entry", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date(2026, 9, 15, 10, 0));
  await mockProjectsApi(page, []);
  await page.goto("/projects");
  await page.getByRole("tab", { name: "Dashboard" }).click();
  // the year range is known once the first logged entry has loaded
  await expect(
    page.getByRole("button", { name: "Previous month" }),
  ).toBeEnabled();

  await page.getByRole("combobox", { name: "Year" }).click();
  await expect(page.getByRole("option")).toHaveText(["2024", "2025", "2026"]);
  await page.getByRole("option", { name: "2024" }).click();
  await page.getByRole("combobox", { name: "Month" }).click();
  await page.getByRole("option", { name: "June" }).click();

  await expect(page.getByText("No time logged in June 2024.")).toBeVisible();
});

test("project detail shows tasks by default and its KPIs and charts in the Dashboard tab", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date(2026, 9, 15, 10, 0));
  await mockProjectsApi(page, [
    makeProject({ id: 7, title: "Translate manual" }),
  ]);
  const timeEntryVars: Record<string, unknown>[] = [];
  page.on("request", (req) => {
    if (!req.url().includes("/graphql") || req.method() !== "POST") return;
    const body = req.postDataJSON() as {
      operationName: string;
      variables?: Record<string, unknown>;
    };
    if (body.operationName === "TimeEntries" && body.variables) {
      timeEntryVars.push(body.variables);
    }
  });
  await page.goto("/projects/7");

  await expect(page.getByRole("tab", { name: "Tasks" })).toHaveAttribute(
    "data-state",
    "active",
  );
  await expect(page.getByText("Time per task")).toHaveCount(0);

  await page.getByRole("tab", { name: "Dashboard" }).click();
  await expect(page.getByText("Time logged", { exact: true })).toBeVisible();
  await expect(page.getByText("Time per task")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Previous month" }),
  ).toBeEnabled();

  await page.getByRole("button", { name: "Previous month" }).click();

  await expect(page.getByText("No time logged in September 2026.")).toHaveCount(
    2,
  );
  const septemberStart = await page.evaluate(() =>
    new Date(2026, 8, 1).toISOString(),
  );
  await expect
    .poll(() => timeEntryVars)
    .toContainEqual(
      expect.objectContaining({
        projectId: 7,
        start: septemberStart,
        pagination: { limit: 1000 },
      }),
    );
});

test("a translation task shows its own words plus its checklist words next to its name", async ({
  page,
}) => {
  await mockProjectsApi(page, [
    makeProject({
      id: 7,
      title: "Translate manual",
      occupations: [TRANSLATION_OCCUPATION],
    }),
  ]);
  const task = {
    id: 40,
    projectId: 7,
    assigneeId: null,
    title: "Chapter 1",
    description: null,
    status: "TODO",
    dueDate: null,
    wordCount: 500,
    startDate: null,
    recurring: null,
    reminderOffset: null,
    sortOrder: 0,
    totalTimeSeconds: 0,
    createdAt: NOW,
    updatedAt: NOW,
  };
  // Registered after mockProjectsApi, so these handlers win for task ops.
  await page.route("**/graphql", async (route) => {
    const { operationName } = route.request().postDataJSON() as {
      operationName: string;
    };
    const respond = (data: unknown) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data }),
      });
    if (operationName === "Tasks") {
      return respond({ tasks: { items: [task], nextCursor: null, total: 1 } });
    }
    if (operationName === "Task") {
      return respond({
        task: {
          ...task,
          checklistTitles: ["Sections"],
          subtasks: [
            {
              id: 1,
              taskId: 40,
              checklistTitle: "Sections",
              title: "Section A",
              done: false,
              dueDate: null,
              wordCount: 200,
              createdAt: NOW,
              updatedAt: NOW,
            },
          ],
          comments: [],
          labels: [],
          activities: [],
          attachments: [],
        },
      });
    }
    return route.fallback();
  });
  await page.goto("/projects/7");

  await page.getByText("Chapter 1").first().click();

  await expect(page.getByText("700 words")).toBeVisible();
  await expect(page.getByText("200 words")).toBeVisible();
  await expect(page.locator("#task-words-40")).toHaveValue("500");
});
