import { test, expect } from "@playwright/test";
import { MOCK_USER, mockGraphQL } from "./helpers/mock";

// Login page

test("login page renders required elements", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Register" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Continue with Google/i }),
  ).toBeVisible();
});

test("successful login navigates to dashboard", async ({ page }) => {
  let authenticated = false;

  await page.route("**/graphql", async (route) => {
    const { operationName } = route.request().postDataJSON() as {
      operationName: string;
    };

    if (operationName === "Me") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: { me: authenticated ? MOCK_USER : null },
        }),
      });
    } else if (operationName === "Login") {
      authenticated = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            login: {
              user: MOCK_USER,
              requiresTwoFactor: false,
              tempToken: null,
            },
          },
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: null }),
      });
    }
  });

  await page.goto("/login");
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/");
});

test("login failure shows error message", async ({ page }) => {
  await page.route("**/graphql", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        errors: [{ message: "Invalid credentials" }],
      }),
    });
  });

  await page.goto("/login");
  await page.getByLabel("Email").fill("wrong@example.com");
  await page.getByLabel("Password").fill("wrongpass");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Invalid credentials")).toBeVisible();
});

test("login 2FA required navigates to /2fa/verify", async ({ page }) => {
  await page.route("**/graphql", async (route) => {
    const { operationName } = route.request().postDataJSON() as {
      operationName: string;
    };
    if (operationName === "Login") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            login: {
              user: null,
              requiresTwoFactor: true,
              tempToken: "temp-abc123",
            },
          },
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: null }),
      });
    }
  });

  await page.goto("/login");
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/2fa/verify");
  await expect(page.getByLabel("Authenticator code")).toBeVisible();
});

// Register page

test("register page renders required elements", async ({ page }) => {
  await page.goto("/register");
  await expect(page.getByLabel("Name (optional)")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create account" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
});

test("successful register navigates to dashboard", async ({ page }) => {
  let registered = false;

  await page.route("**/graphql", async (route) => {
    const { operationName } = route.request().postDataJSON() as {
      operationName: string;
    };

    if (operationName === "Me") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: { me: registered ? MOCK_USER : null },
        }),
      });
    } else if (operationName === "Register") {
      registered = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: { register: MOCK_USER },
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: null }),
      });
    }
  });

  await page.goto("/register");
  await page.getByLabel("Email").fill("new@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL("/");
});

// Cross-page navigation

test("register link on login page navigates to /register", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Register" }).click();
  await expect(page).toHaveURL("/register");
});

test("sign in link on register page navigates to /login", async ({ page }) => {
  await page.goto("/register");
  await page.getByRole("link", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/login");
});

// 2FA verify page

test("/2fa/verify without router state redirects to /login", async ({
  page,
}) => {
  await page.goto("/2fa/verify");
  await expect(page).toHaveURL("/login");
});

test("/2fa/verify with tempToken renders code input", async ({ page }) => {
  await mockGraphQL(page, {
    VerifyTwoFactor: {
      verifyTwoFactor: { user: null },
    },
  });

  // Navigate to login and trigger 2FA flow to get proper router state
  await page.route("**/graphql", async (route) => {
    const { operationName } = route.request().postDataJSON() as {
      operationName: string;
    };
    if (operationName === "Login") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            login: {
              user: null,
              requiresTwoFactor: true,
              tempToken: "tok123",
            },
          },
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: null }),
      });
    }
  });

  await page.goto("/login");
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL("/2fa/verify");
  await expect(page.getByLabel("Authenticator code")).toBeVisible();
  await expect(page.getByRole("button", { name: "Verify" })).toBeDisabled(); // disabled until 6 digits entered
});
