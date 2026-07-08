import type { Page } from "@playwright/test";

export const MOCK_USER = {
  __typename: "User",
  id: 1,
  email: "test@example.com",
  name: "Test User",
  role: "USER",
  twoFactorEnabled: false,
};

export const MOCK_USER_2FA = { ...MOCK_USER, twoFactorEnabled: true };

type GqlData = Record<string, unknown> | null;
type GqlHandler = GqlData | (() => GqlData);

export async function mockGraphQL(
  page: Page,
  handlers: Record<string, GqlHandler>,
) {
  await page.route("**/graphql", async (route) => {
    const body = route.request().postDataJSON() as { operationName: string };
    const raw = handlers[body.operationName];
    const data = typeof raw === "function" ? raw() : (raw ?? null);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data }),
    });
  });
}

export async function mockAuthenticated(page: Page, user = MOCK_USER) {
  await mockGraphQL(page, { Me: { me: user } });
}

export async function mockUnauthenticated(page: Page) {
  await mockGraphQL(page, { Me: { me: null } });
}

export async function mockClockifyStatus(
  page: Page,
  status: { connected: boolean; workspaceId: string | null },
) {
  await page.route("**/clockify/status", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(status),
    });
  });
}

export async function mockClockifyWorkspaces(page: Page) {
  await page.route("**/clockify/workspaces", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { id: "ws1", name: "My Workspace", imageUrl: null },
      ]),
    });
  });
}

export async function mockClockifyTracker(page: Page, workspaceId = "ws1") {
  // TrackerView also fetches the plain workspace list (for the plan badge /
  // billability-lock check) independent of the workspace-scoped routes below.
  await mockClockifyWorkspaces(page);

  await page.route(
    new RegExp(`/clockify/workspaces/${workspaceId}/projects$`),
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "p1",
            name: "Project A",
            color: "#aaa",
            archived: false,
            clientId: null,
          },
        ]),
      });
    },
  );

  await page.route(
    new RegExp(`/clockify/workspaces/${workspaceId}/entries/active$`),
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(null),
      });
    },
  );

  await page.route(
    new RegExp(`/clockify/workspaces/${workspaceId}/entries(\\?.*)?$`),
    async (route) => {
      if (route.request().method() !== "GET") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    },
  );

  await page.route(
    new RegExp(`/clockify/workspaces/${workspaceId}/tags$`),
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    },
  );
}

export async function mockGoogleCalendarStatus(
  page: Page,
  status: { connected: boolean; email: string | null },
) {
  await page.route("**/google-calendar/status", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(status),
    });
  });
}

export async function mockGoogleCalendarEvents(
  page: Page,
  events: {
    id: string;
    summary?: string;
    start: { date?: string; dateTime?: string };
    end: { date?: string; dateTime?: string };
    htmlLink?: string;
  }[] = [],
) {
  await page.route(
    new RegExp("/google-calendar/events(\\?.*)?$"),
    async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ items: events }),
        });
        return;
      }
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "e-new",
            ...(route.request().postDataJSON() as object),
          }),
        });
        return;
      }
      await route.continue();
    },
  );
}
