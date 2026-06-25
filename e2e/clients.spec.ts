import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { MOCK_USER } from "./helpers/mock";

type MockContact = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
};

type MockClient = {
  id: number;
  name: string;
  status: string;
  clientType: string;
  contactedAt: string | null;
  email?: string | null;
  contacts?: MockContact[];
};

function makeClient(overrides: Partial<MockClient> = {}): MockClient {
  return {
    id: 1,
    name: "Acme Co",
    status: "CLIENT",
    clientType: "COMPANY",
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
  firstName: null,
  lastName: null,
  paymentDelayDays: null,
  taxRate: null,
  billingEndOfMonth: false,
  website: null,
  industry: null,
  tags: [],
  contacts: [] as MockContact[],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

// Mocks /graphql for the Clients feature: auth + client CRUD + company contact
// CRUD, with real filtering semantics (status/clientType/search) so the mock
// behaves like the real backend rather than just echoing fixed data.
async function mockClientsApi(page: Page, initial: MockClient[]) {
  let clients = initial.map((c) => ({ ...CLIENT_DEFAULTS, ...c }));
  let nextClientId = clients.reduce((max, c) => Math.max(max, c.id), 0) + 1;
  let nextContactId =
    clients
      .flatMap((c) => c.contacts)
      .reduce((max, c) => Math.max(max, c.id), 0) + 1;

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

    if (operationName === "Clients") {
      const status = variables?.["status"] as string | undefined;
      const clientType = variables?.["clientType"] as string | undefined;
      const search = variables?.["search"] as string | undefined;
      const items = clients.filter(
        (c) =>
          (!status || c.status === status) &&
          (!clientType || c.clientType === clientType) &&
          (!search || c.name.toLowerCase().includes(search.toLowerCase())),
      );
      return respond({
        clients: { items, nextCursor: null, total: items.length },
      });
    }

    if (operationName === "Client") {
      const id = variables?.["id"] as number;
      const client = clients.find((c) => c.id === id) ?? null;
      return respond({ client });
    }

    if (operationName === "CreateClient") {
      const input = (variables?.["input"] ?? {}) as Partial<MockClient>;
      const created = {
        ...CLIENT_DEFAULTS,
        id: nextClientId++,
        name: input.name ?? "New",
        status: input.status ?? "CLIENT",
        clientType: input.clientType ?? "COMPANY",
        contactedAt: null,
      };
      clients = [...clients, created];
      return respond({ createClient: created });
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
      return respond({ updateClient: updated });
    }

    if (operationName === "DeleteClient") {
      const id = variables?.["id"] as number | undefined;
      clients = clients.filter((c) => c.id !== id);
      return respond({ deleteClient: true });
    }

    if (operationName === "CreateCompanyContact") {
      const input = (variables?.["input"] ?? {}) as Partial<MockContact> & {
        clientId: number;
      };
      const created: MockContact = {
        id: nextContactId++,
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
      };
      clients = clients.map((c) =>
        c.id === input.clientId
          ? { ...c, contacts: [...(c.contacts ?? []), created] }
          : c,
      );
      return respond({ createCompanyContact: created });
    }

    if (operationName === "UpdateCompanyContact") {
      const input = variables?.["input"] as
        | (Partial<MockContact> & { id: number })
        | undefined;
      let updated: MockContact | undefined;
      clients = clients.map((c) => ({
        ...c,
        contacts: (c.contacts ?? []).map((contact) => {
          if (contact.id !== input?.id) return contact;
          updated = { ...contact, ...input };
          return updated;
        }),
      }));
      return respond({ updateCompanyContact: updated });
    }

    if (operationName === "DeleteCompanyContact") {
      const id = variables?.["id"] as number | undefined;
      clients = clients.map((c) => ({
        ...c,
        contacts: (c.contacts ?? []).filter((contact) => contact.id !== id),
      }));
      return respond({ deleteCompanyContact: true });
    }

    return respond(null);
  });
}

test("search filters the Clients list by name", async ({ page }) => {
  await mockClientsApi(page, [
    makeClient({ id: 1, name: "Acme Corp" }),
    makeClient({ id: 2, name: "Globex Inc" }),
  ]);
  await page.goto("/clients");

  await expect(page.getByText("Acme Corp")).toBeVisible();
  await expect(page.getByText("Globex Inc")).toBeVisible();

  await page.getByLabel("Search clients").fill("acme");

  await expect(page.getByText("Globex Inc")).not.toBeVisible();
  await expect(page.getByText("Acme Corp")).toBeVisible();
});

test("Companies/Individuals tabs filter the list by clientType", async ({
  page,
}) => {
  await mockClientsApi(page, [
    makeClient({ id: 1, name: "Acme Corp", clientType: "COMPANY" }),
    makeClient({ id: 2, name: "Jane Smith", clientType: "INDIVIDUAL" }),
  ]);
  await page.goto("/clients");

  await expect(page.getByText("Acme Corp")).toBeVisible();
  await expect(page.getByText("Jane Smith")).toBeVisible();

  await page.getByRole("tab", { name: "Individuals" }).click();
  await expect(page.getByText("Acme Corp")).not.toBeVisible();
  await expect(page.getByText("Jane Smith")).toBeVisible();

  await page.getByRole("tab", { name: "Companies" }).click();
  await expect(page.getByText("Jane Smith")).not.toBeVisible();
  await expect(page.getByText("Acme Corp")).toBeVisible();
});

test("creates a client from /clients, it appears in the list", async ({
  page,
}) => {
  await mockClientsApi(page, []);
  await page.goto("/clients");

  await page.getByRole("button", { name: "New client" }).click();
  await page.getByLabel("Company name *").fill("Brand New Co");
  await page.getByRole("button", { name: "Create client" }).click();

  await expect(page.getByText("Brand New Co")).toBeVisible();
});

test("clicking a client card navigates to its detail page", async ({
  page,
}) => {
  await mockClientsApi(page, [makeClient({ id: 42, name: "Acme Corp" })]);
  await page.goto("/clients");

  await page.getByText("Acme Corp").click();
  await expect(page).toHaveURL("/clients/42");
});

test("ClientHeader Edit -> change a field -> Save persists the new value", async ({
  page,
}) => {
  await mockClientsApi(page, [makeClient({ id: 5, name: "Acme Corp" })]);
  await page.goto("/clients/5");

  await expect(page.getByText("Acme Corp")).toBeVisible();
  await page.getByText("Edit").click();
  await page.getByLabel("Name", { exact: true }).fill("Acme Renamed");
  await page.getByText("Save").click();

  await expect(page.getByText("Acme Renamed")).toBeVisible();
});

test("ContactsTab: add, edit, then delete a contact", async ({ page }) => {
  await mockClientsApi(page, [makeClient({ id: 6, name: "Acme Corp" })]);
  await page.goto("/clients/6");

  await page.getByText("+ Add contact").click();
  await page.getByLabel("First name").fill("Jane");
  await page.getByLabel("Last name").fill("Doe");
  await page.getByText("Add contact").click();

  await expect(page.getByText("Jane Doe")).toBeVisible();

  await page.getByRole("button", { name: "✎" }).click();
  await page.getByLabel("First name").fill("Janet");
  await page.getByText("Save").click();

  await expect(page.getByText("Janet Doe")).toBeVisible();

  await page.getByRole("button", { name: "✕" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();

  await expect(page.getByText("Janet Doe")).not.toBeVisible();
  await expect(page.getByText("No contacts yet.")).toBeVisible();
});

test("deletes a client from the list via the confirm dialog", async ({
  page,
}) => {
  await mockClientsApi(page, [makeClient({ id: 1, name: "To Delete" })]);
  await page.goto("/clients");

  await expect(page.getByText("To Delete")).toBeVisible();
  await page.getByText("✕").click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();

  await expect(page.getByText("To Delete")).not.toBeVisible();
});
