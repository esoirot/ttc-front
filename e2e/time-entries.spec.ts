import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { MOCK_USER, mockClockifyStatus } from "./helpers/mock";

const NOW = "2026-01-01T00:00:00.000Z";

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

type MockProject = {
  id: number;
  title: string;
  occupations: { id: number; name: string; occupationType: string }[];
};

type MockEntry = {
  id: number;
  userId: number;
  projectId: number | null;
  taskId: number | null;
  subtaskId: number | null;
  description: string | null;
  startTime: string;
  endTime: string | null;
  durationSeconds: number | null;
  billable: boolean;
  clockifyEntryId: string | null;
  occupationId: number | null;
  occupation: { id: number; name: string; occupationType: string } | null;
  tags: { id: number; name: string }[];
  createdAt: string;
  updatedAt: string;
};

function makeEntry(overrides: Partial<MockEntry> = {}): MockEntry {
  return {
    id: 1,
    userId: 1,
    projectId: null,
    taskId: null,
    subtaskId: null,
    description: "Translate homepage",
    startTime: "2026-01-01T08:00:00.000Z",
    endTime: "2026-01-01T09:00:00.000Z",
    durationSeconds: 3600,
    billable: true,
    clockifyEntryId: null,
    occupationId: null,
    occupation: null,
    tags: [],
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

// Mocks /graphql for the TTC-native /time page (TimeEntriesPage ->
// useTimeEntriesPage): TimeEntries/ActiveTimer/Projects/Tags/MyOccupations,
// plus the UpdateTimeEntry mutation with real state so edits are observable.
async function mockTimeEntriesApi(
  page: Page,
  initial: MockEntry[],
  projects: MockProject[] = [],
) {
  let entries = initial.map((e) => ({ ...e }));

  await mockClockifyStatus(page, { connected: false, workspaceId: null });

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

    if (operationName === "MyOccupations") {
      return respond({
        myOccupations: [TRANSLATION_OCCUPATION, CORRECTOR_OCCUPATION],
      });
    }

    if (operationName === "Projects") {
      return respond({
        projects: { items: projects, nextCursor: null, total: projects.length },
      });
    }

    if (operationName === "Tags") {
      return respond({ tags: [] });
    }

    if (operationName === "ActiveTimer") {
      return respond({ activeTimer: null });
    }

    if (operationName === "TimeEntries") {
      return respond({
        timeEntries: {
          items: entries,
          nextCursor: null,
          total: entries.length,
        },
      });
    }

    if (operationName === "UpdateTimeEntry") {
      const input = variables?.["input"] as
        (Partial<MockEntry> & { id: number }) | undefined;
      entries = entries.map((e) => {
        if (e.id !== input?.id) return e;
        const updated = { ...e, ...input };
        if (input.occupationId !== undefined) {
          const all = [TRANSLATION_OCCUPATION, CORRECTOR_OCCUPATION];
          updated.occupation =
            all.find((a) => a.id === input.occupationId) ?? null;
        }
        return updated;
      });
      const updated = entries.find((e) => e.id === input?.id);
      return respond({ updateTimeEntry: updated });
    }

    return respond(null);
  });
}

test("the Occupation select on a row is scoped to its project's occupations, and changing it fires UpdateTimeEntry", async ({
  page,
}) => {
  await mockTimeEntriesApi(
    page,
    [
      makeEntry({
        id: 1,
        projectId: 1,
        description: "Translate homepage",
      }),
    ],
    [{ id: 1, title: "Website copy", occupations: [TRANSLATION_OCCUPATION] }],
  );
  await page.goto("/time");

  await page.getByRole("button", { name: /Jan 1/ }).click();
  await expect(page.getByText("Translate homepage")).toBeVisible();
  await page.getByTitle("Link occupation").click();
  await expect(page.getByRole("option", { name: "Translation" })).toBeVisible();
  await expect(
    page.getByRole("option", { name: "Proofreading" }),
  ).not.toBeVisible();
  await page.getByRole("option", { name: "Translation" }).click();

  await expect(page.getByText("Translation", { exact: true })).toBeVisible();
});

test("time entries have no words control, even on a Translator entry", async ({
  page,
}) => {
  await mockTimeEntriesApi(
    page,
    [
      makeEntry({
        id: 1,
        projectId: 1,
        description: "Translate homepage",
        occupationId: 1,
        occupation: TRANSLATION_OCCUPATION,
      }),
    ],
    [{ id: 1, title: "Website copy", occupations: [TRANSLATION_OCCUPATION] }],
  );
  await page.goto("/time");

  await page.getByRole("button", { name: /Jan 1/ }).click();
  await expect(page.getByText("Translate homepage")).toBeVisible();
  await expect(page.getByText("+ words")).toHaveCount(0);
  await expect(page.getByLabel("Words processed")).toHaveCount(0);
});
