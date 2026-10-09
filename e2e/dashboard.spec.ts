import { test, expect } from "@playwright/test";
import {
  mockGoogleCalendarStatus,
  mockGraphQL,
  MOCK_USER,
  MOCK_USER_2FA,
} from "./helpers/mock";

test("dashboard shows heading and welcome message", async ({ page }) => {
  await mockGraphQL(page, { Me: { me: MOCK_USER } });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText(`Welcome back, ${MOCK_USER.name}`)).toBeVisible();
});

test("2FA prompt shown when twoFactorEnabled is false", async ({ page }) => {
  await mockGraphQL(page, { Me: { me: MOCK_USER } });
  await page.goto("/");
  await expect(page.getByText("Secure your account")).toBeVisible();
  await expect(page.getByRole("link", { name: "Enable 2FA" })).toBeVisible();
});

test("2FA prompt hidden when twoFactorEnabled is true", async ({ page }) => {
  await mockGraphQL(page, { Me: { me: MOCK_USER_2FA } });
  await page.goto("/");
  await expect(page.getByText("Secure your account")).not.toBeVisible();
  await expect(
    page.getByRole("link", { name: "Enable 2FA" }),
  ).not.toBeVisible();
});

test("Enable 2FA link navigates to /settings/2fa", async ({ page }) => {
  await mockGraphQL(page, { Me: { me: MOCK_USER } });
  await page.goto("/");
  await page.getByRole("link", { name: "Enable 2FA" }).click();
  await expect(page).toHaveURL("/settings/2fa");
});

const BASE_DASHBOARD_STATS = {
  activeProjectCount: 0,
  monthToDateSeconds: 0,
  monthToDateRevenue: 0,
  upcomingDeadlines: [],
  recentTimeEntries: [],
};

test("Prospects to contact widget lists due prospects and links to client detail", async ({
  page,
}) => {
  await mockGraphQL(page, {
    Me: { me: MOCK_USER },
    Dashboard: {
      dashboard: {
        ...BASE_DASHBOARD_STATS,
        prospectsToContact: [
          { id: 7, name: "Acme Corp", status: "TO_CONTACT", contactedAt: null },
          {
            id: 8,
            name: "Globex Inc",
            status: "FOLLOW_UP_1",
            contactedAt: new Date(
              Date.now() - 14 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          },
        ],
      },
    },
  });
  await mockGoogleCalendarStatus(page, { connected: false, email: null });
  await page.goto("/");

  await expect(page.getByText("Prospects to contact")).toBeVisible();
  await expect(page.getByText("Acme Corp")).toBeVisible();
  await expect(page.getByText("Never contacted")).toBeVisible();
  await expect(page.getByText("Globex Inc")).toBeVisible();
  await expect(page.getByText("2 weeks ago")).toBeVisible();

  await page.getByRole("link", { name: /Acme Corp/ }).click();
  await expect(page).toHaveURL("/clients/7");
});

test("Prospects to contact widget shows empty state when nothing is due", async ({
  page,
}) => {
  await mockGraphQL(page, {
    Me: { me: MOCK_USER },
    Dashboard: {
      dashboard: { ...BASE_DASHBOARD_STATS, prospectsToContact: [] },
    },
  });
  await mockGoogleCalendarStatus(page, { connected: false, email: null });
  await page.goto("/");

  await expect(
    page.getByText("No prospects need follow-up right now."),
  ).toBeVisible();
});

test("Active Projects KPI card navigates to the projects list", async ({
  page,
}) => {
  await mockGraphQL(page, {
    Me: { me: MOCK_USER },
    Dashboard: {
      dashboard: {
        ...BASE_DASHBOARD_STATS,
        activeProjectCount: 4,
        yearToDateWords: 0,
        prospectsToContact: [],
      },
    },
  });
  await mockGoogleCalendarStatus(page, { connected: false, email: null });
  await page.goto("/");

  await page.getByRole("link", { name: /Active Projects/ }).click();
  await expect(page).toHaveURL("/projects");
});

test("Upcoming deadlines flags late, this-week and later items and opens a task", async ({
  page,
}) => {
  const inDays = (n: number) =>
    new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString();
  const row = (
    kind: string,
    id: number,
    title: string,
    days: number,
    taskId: number | null,
  ) => ({
    kind,
    id,
    title,
    deadline: inDays(days),
    projectId: 7,
    projectTitle: "Book",
    taskId,
    taskTitle: taskId ? "Chapter 1" : null,
  });
  await mockGraphQL(page, {
    Me: { me: MOCK_USER },
    Dashboard: {
      dashboard: {
        ...BASE_DASHBOARD_STATS,
        prospectsToContact: [],
        upcomingDeadlines: [
          row("TASK", 3, "Chapter 1", -2, 3),
          row("CHECKLIST_ITEM", 9, "Proofread", 3, 3),
          row("PROJECT", 7, "Book", 20, null),
        ],
      },
    },
  });
  await mockGoogleCalendarStatus(page, { connected: false, email: null });
  await page.goto("/");

  const link = (name: string) =>
    page.getByRole("link", { name: new RegExp(`^${name}`) });
  await expect(link("Late Chapter 1")).toBeVisible();
  await expect(link("Due within a week Proofread")).toBeVisible();
  await expect(link("Upcoming Book")).toBeVisible();

  await expect(link("Late Chapter 1")).toHaveAttribute(
    "href",
    "/projects/7?task=3",
  );
});
