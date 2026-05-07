import { test, expect } from "@playwright/test";
import { mockUnauthenticated } from "./helpers/mock";

const PROTECTED = ["/", "/settings/2fa", "/time-tracker"];

for (const path of PROTECTED) {
  test(`${path} unauthenticated redirects to /login`, async ({ page }) => {
    await mockUnauthenticated(page);
    await page.goto(path);
    await expect(page).toHaveURL("/login");
  });
}
