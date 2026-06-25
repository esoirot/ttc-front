import { test, expect } from "@playwright/test";
import { mockGraphQL, mockClockifyStatus, MOCK_USER } from "./helpers/mock";

test.beforeEach(async ({ page }) => {
  await mockGraphQL(page, { Me: { me: MOCK_USER } });
});

test("sidebar shows all nav items", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(nav.getByRole("link", { name: "Dashboard" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Clients" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Prospects" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Clockify" })).toBeVisible();
});

test("sidebar shows user name and role", async ({ page }) => {
  await page.goto("/");
  // exact: true prevents matching "Welcome back, Test User." on dashboard
  await expect(page.getByText(MOCK_USER.name, { exact: true })).toBeVisible();
  await expect(page.getByText(MOCK_USER.role, { exact: true })).toBeVisible();
});

test("sidebar shows sign out button", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
});

test("Dashboard nav link is active on /", async ({ page }) => {
  await page.goto("/");
  const dashLink = page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Dashboard" });
  await expect(dashLink).toHaveClass(/text-primary/);
});

test("Clockify nav link is active on /time-tracker", async ({ page }) => {
  await mockClockifyStatus(page, { connected: false, workspaceId: null });
  await page.goto("/time-tracker");
  const trackerLink = page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Clockify" });
  await expect(trackerLink).toHaveClass(/text-primary/);
});

test("Clients nav link is active on /clients", async ({ page }) => {
  await mockGraphQL(page, {
    Me: { me: MOCK_USER },
    Clients: { clients: { items: [], nextCursor: null, total: 0 } },
  });
  await page.goto("/clients");
  const clientsLink = page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Clients" });
  await expect(clientsLink).toHaveClass(/text-primary/);
});

test("sidebar nav links navigate correctly", async ({ page }) => {
  await mockGraphQL(page, {
    Me: { me: MOCK_USER },
    Clients: { clients: { items: [], nextCursor: null, total: 0 } },
  });
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Clients" })
    .click();
  await expect(page).toHaveURL("/clients");
});

test("sign out clears session and redirects to /login", async ({ page }) => {
  let loggedOut = false;
  await page.route("**/graphql", async (route) => {
    const { operationName } = route.request().postDataJSON() as {
      operationName: string;
    };
    if (operationName === "Me") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { me: loggedOut ? null : MOCK_USER } }),
      });
    } else if (operationName === "Logout") {
      loggedOut = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { logout: true } }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: null }),
      });
    }
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Sign out" }).click();
  // Navigate to "/" after logout — clearStore clears session, ProtectedRoute redirects
  await page.goto("/");
  await expect(page).toHaveURL("/login");
});
