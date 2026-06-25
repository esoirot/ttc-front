import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { MOCK_USER } from "./helpers/mock";

type MockClient = {
  id: number;
  name: string;
  status: string;
  contactedAt: string | null;
};

function makeProspect(overrides: Partial<MockClient> = {}): MockClient {
  return {
    id: 1,
    name: "Acme Co",
    status: "TO_CONTACT",
    contactedAt: null,
    ...overrides,
  };
}

const CLIENT_DEFAULTS = {
  __typename: "Client",
  userId: 1,
  legalName: null,
  email: null,
  phone: null,
  company: null,
  address: null,
  city: null,
  country: null,
  postalCode: null,
  vatNumber: null,
  notes: null,
  hubspotId: null,
  clientType: "COMPANY",
  firstName: null,
  lastName: null,
  paymentDelayDays: null,
  taxRate: null,
  billingEndOfMonth: false,
  website: null,
  industry: null,
  tags: [],
  contacts: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

// Mocks /graphql for the whole Prospect feature: auth + clients CRUD,
// with real filtering semantics (status/excludeStatus) so the mock behaves
// like the real backend rather than just echoing fixed data.
async function mockProspectsApi(page: Page, initial: MockClient[]) {
  let clients = initial.map((c) => ({ ...CLIENT_DEFAULTS, ...c }));
  let nextId = clients.reduce((max, c) => Math.max(max, c.id), 0) + 1;

  await page.route("**/graphql", async (route) => {
    const body = route.request().postDataJSON() as {
      operationName: string;
      variables?: Record<string, unknown>;
    };
    const { operationName, variables } = body;

    if (operationName === "Me") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { me: MOCK_USER } }),
      });
      return;
    }

    if (operationName === "Clients") {
      const excludeStatus = variables?.["excludeStatus"] as string | undefined;
      const status = variables?.["status"] as string | undefined;
      const search = variables?.["search"] as string | undefined;
      const items = clients.filter(
        (c) =>
          (!excludeStatus || c.status !== excludeStatus) &&
          (!status || c.status === status) &&
          (!search || c.name.toLowerCase().includes(search.toLowerCase())),
      );
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: { clients: { items, nextCursor: null, total: items.length } },
        }),
      });
      return;
    }

    if (operationName === "CreateClient") {
      const input = (variables?.["input"] ?? {}) as Partial<MockClient>;
      const created = {
        ...CLIENT_DEFAULTS,
        id: nextId++,
        name: input.name ?? "New",
        status: input.status ?? "CLIENT",
        contactedAt: null,
      };
      clients = [...clients, created];
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { createClient: created } }),
      });
      return;
    }

    if (operationName === "UpdateClient") {
      const input = variables?.["input"] as
        | (Partial<MockClient> & { id: number })
        | undefined;
      if (input) {
        clients = clients.map((c) =>
          c.id === input.id ? { ...c, ...input } : c,
        );
      }
      const updated = clients.find((c) => c.id === input?.id);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { updateClient: updated } }),
      });
      return;
    }

    if (operationName === "DeleteClient") {
      const id = variables?.["id"] as number | undefined;
      clients = clients.filter((c) => c.id !== id);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { deleteClient: true } }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: null }),
    });
  });
}

test("sidebar Prospects link navigates to /prospects", async ({ page }) => {
  await mockProspectsApi(page, []);
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Prospects" })
    .click();
  await expect(page).toHaveURL("/prospects");
});

test("shows all board columns", async ({ page }) => {
  await mockProspectsApi(page, []);
  await page.goto("/prospects");

  for (const label of [
    "Prospect (0)",
    "1st Contact (0)",
    "Follow up 1 (0)",
    "Follow up 2 (0)",
    "Follow up 3 (0)",
    "Recontact Later (0)",
    "Talking (0)",
  ]) {
    await expect(page.getByText(label)).toBeVisible();
  }
});

test("buckets prospects into the correct column by status", async ({
  page,
}) => {
  await mockProspectsApi(page, [
    makeProspect({ id: 1, name: "Lead A", status: "TO_CONTACT" }),
    makeProspect({ id: 2, name: "Lead B", status: "FOLLOW_UP_2" }),
    makeProspect({ id: 3, name: "Lead C", status: "TALKING" }),
  ]);
  await page.goto("/prospects");

  await expect(
    page.getByTestId("prospect-column-TO_CONTACT").getByText("Lead A"),
  ).toBeVisible();
  await expect(
    page.getByTestId("prospect-column-FOLLOW_UP_2").getByText("Lead B"),
  ).toBeVisible();
  await expect(
    page.getByTestId("prospect-column-TALKING").getByText("Lead C"),
  ).toBeVisible();
});

test("converted clients (status CLIENT) never show up on the board", async ({
  page,
}) => {
  await mockProspectsApi(page, [
    makeProspect({ id: 1, name: "Real Client", status: "CLIENT" }),
    makeProspect({ id: 2, name: "Active Lead", status: "TO_CONTACT" }),
  ]);
  await page.goto("/prospects");

  await expect(page.getByText("Active Lead")).toBeVisible();
  await expect(page.getByText("Real Client")).not.toBeVisible();
});

test("creates a new prospect, appears in the Prospect column", async ({
  page,
}) => {
  await mockProspectsApi(page, []);
  await page.goto("/prospects");

  await page.getByRole("button", { name: "New prospect" }).click();
  await page.getByLabel("Company name *").fill("Brand New Co");
  await page.getByRole("button", { name: "Create client" }).click();

  await expect(
    page.getByTestId("prospect-column-TO_CONTACT").getByText("Brand New Co"),
  ).toBeVisible();
});

test("deletes a prospect via the confirm dialog", async ({ page }) => {
  await mockProspectsApi(page, [
    makeProspect({ id: 1, name: "To Delete", status: "TO_CONTACT" }),
  ]);
  await page.goto("/prospects");

  await expect(page.getByText("To Delete")).toBeVisible();
  await page.getByRole("button", { name: "Delete prospect" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();

  await expect(page.getByText("To Delete")).not.toBeVisible();
});

test("search filters prospects by name", async ({ page }) => {
  await mockProspectsApi(page, [
    makeProspect({ id: 1, name: "Acme Corp", status: "TO_CONTACT" }),
    makeProspect({ id: 2, name: "Globex Inc", status: "TO_CONTACT" }),
  ]);
  await page.goto("/prospects");

  await expect(page.getByText("Acme Corp")).toBeVisible();
  await expect(page.getByText("Globex Inc")).toBeVisible();

  await page.getByLabel("Search prospects").fill("acme");

  await expect(page.getByText("Globex Inc")).not.toBeVisible();
  await expect(page.getByText("Acme Corp")).toBeVisible();
});

test("dragging a card to another column updates its status", async ({
  page,
}) => {
  await mockProspectsApi(page, [
    makeProspect({ id: 1, name: "Drag Me", status: "TO_CONTACT" }),
  ]);
  await page.goto("/prospects");

  const handle = page
    .getByTestId("prospect-card-1")
    .getByLabel("Drag to change status");
  const source = await handle.boundingBox();
  const target = await page
    .getByTestId("prospect-column-CONTACTED")
    .boundingBox();
  if (!source || !target) throw new Error("missing bounding box");

  await page.mouse.move(
    source.x + source.width / 2,
    source.y + source.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    source.x + source.width / 2 + 20,
    source.y + source.height / 2,
    { steps: 5 },
  );
  await page.mouse.move(
    target.x + target.width / 2,
    target.y + target.height / 2,
    { steps: 10 },
  );
  await page.mouse.up();

  await expect(
    page.getByTestId("prospect-column-CONTACTED").getByText("Drag Me"),
  ).toBeVisible();
  await expect(
    page.getByTestId("prospect-column-TO_CONTACT").getByText("Drag Me"),
  ).not.toBeVisible();
});

test("Clients page only shows clients with status CLIENT", async ({ page }) => {
  await mockProspectsApi(page, [
    makeProspect({ id: 1, name: "Real Client", status: "CLIENT" }),
    makeProspect({ id: 2, name: "Still A Prospect", status: "FOLLOW_UP_1" }),
  ]);
  await page.goto("/clients");

  await expect(page.getByText("Real Client")).toBeVisible();
  await expect(page.getByText("Still A Prospect")).not.toBeVisible();
});
