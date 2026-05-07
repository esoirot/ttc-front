import { test, expect } from "@playwright/test";
import { mockGraphQL, MOCK_USER, MOCK_USER_2FA } from "./helpers/mock";

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
