import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { MOCK_USER, mockClockifyStatus } from "./helpers/mock";

const NOW = "2026-01-01T00:00:00.000Z";

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

type MockProject = {
  id: number;
  title: string;
  activities: { id: number; name: string; activityType: string }[];
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
  activityId: number | null;
  activity: { id: number; name: string; activityType: string } | null;
  wordsProcessed: number | null;
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
    activityId: null,
    activity: null,
    wordsProcessed: null,
    tags: [],
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

// Mocks /graphql for the TTC-native /time page (TimeEntriesPage ->
// useTimeEntriesPage): TimeEntries/ActiveTimer/Projects/Tags/MyActivities,
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

    if (operationName === "MyActivities") {
      return respond({
        myActivities: [TRANSLATION_ACTIVITY, CORRECTOR_ACTIVITY],
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
        if (input.activityId !== undefined) {
          const all = [TRANSLATION_ACTIVITY, CORRECTOR_ACTIVITY];
          updated.activity = all.find((a) => a.id === input.activityId) ?? null;
        }
        return updated;
      });
      const updated = entries.find((e) => e.id === input?.id);
      return respond({ updateTimeEntry: updated });
    }

    return respond(null);
  });
}

test("the Activity select on a row is scoped to its project's activities, and changing it fires UpdateTimeEntry", async ({
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
    [{ id: 1, title: "Website copy", activities: [TRANSLATION_ACTIVITY] }],
  );
  await page.goto("/time");

  await page.getByRole("button", { name: /Jan 1/ }).click();
  await expect(page.getByText("Translate homepage")).toBeVisible();
  await page.getByTitle("Link activity").click();
  await expect(page.getByRole("option", { name: "Translation" })).toBeVisible();
  await expect(
    page.getByRole("option", { name: "Proofreading" }),
  ).not.toBeVisible();
  await page.getByRole("option", { name: "Translation" }).click();

  await expect(page.getByText("Translation", { exact: true })).toBeVisible();
});

test("the words-processed control only appears once the entry's activity is Translator", async ({
  page,
}) => {
  await mockTimeEntriesApi(
    page,
    [
      makeEntry({
        id: 1,
        projectId: 1,
        description: "Translate homepage",
        activityId: 1,
        activity: TRANSLATION_ACTIVITY,
      }),
    ],
    [{ id: 1, title: "Website copy", activities: [TRANSLATION_ACTIVITY] }],
  );
  await page.goto("/time");

  await page.getByRole("button", { name: /Jan 1/ }).click();
  await expect(page.getByTitle("Edit words processed")).toBeVisible();

  await page.getByTitle("Edit words processed").click();
  await page.getByLabel("Words processed").fill("1200");
  await page.getByLabel("Words processed").press("Enter");

  await expect(page.getByText("1,200 words")).toBeVisible();
});

test("the words-processed control is absent when the entry has no activity", async ({
  page,
}) => {
  await mockTimeEntriesApi(page, [
    makeEntry({ id: 1, description: "Untagged work" }),
  ]);
  await page.goto("/time");

  await page.getByRole("button", { name: /Jan 1/ }).click();
  await expect(page.getByText("Untagged work")).toBeVisible();
  await expect(page.getByTitle("Edit words processed")).not.toBeVisible();
});
