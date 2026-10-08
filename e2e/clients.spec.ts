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
  occupations?: { id: number; name: string; occupationType: string }[];
};

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
  occupations: [] as { id: number; name: string; occupationType: string }[],
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

    if (operationName === "MyOccupations") {
      return respond({
        myOccupations: [TRANSLATION_OCCUPATION, CORRECTOR_OCCUPATION],
      });
    }

    if (operationName === "Clients") {
      const status = variables?.["status"] as string | undefined;
      const clientType = variables?.["clientType"] as string | undefined;
      const search = variables?.["search"] as string | undefined;
      const industry = variables?.["industry"] as string | undefined;
      const has = (value: string | null, part: unknown) =>
        !part ||
        (value ?? "").toLowerCase().includes(String(part).toLowerCase());
      const items = clients.filter(
        (c) =>
          has(c.name, variables?.["companyName"]) &&
          has(c.firstName, variables?.["firstName"]) &&
          has(c.lastName, variables?.["lastName"]) &&
          (!status || c.status === status) &&
          (!clientType || c.clientType === clientType) &&
          (!industry || c.industry === industry) &&
          (!search || c.name.toLowerCase().includes(search.toLowerCase())),
      );
      const sort = variables?.["sort"] as
        | { field: "NAME" | "LAST_NAME" | "FIRST_NAME"; direction: string }
        | undefined;
      if (sort) {
        const key = {
          NAME: "name",
          LAST_NAME: "lastName",
          FIRST_NAME: "firstName",
        }[sort.field] as "name" | "lastName" | "firstName";
        items.sort(
          (a, b) =>
            (sort.direction === "DESC" ? -1 : 1) *
            (a[key] ?? "").localeCompare(b[key] ?? ""),
        );
      }
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
      const input = (variables?.["input"] ?? {}) as Partial<MockClient> & {
        occupationIds?: number[];
      };
      const allOccupations = [TRANSLATION_OCCUPATION, CORRECTOR_OCCUPATION];
      const created = {
        ...CLIENT_DEFAULTS,
        id: nextClientId++,
        name: input.name ?? "New",
        status: input.status ?? "CLIENT",
        clientType: input.clientType ?? "COMPANY",
        contactedAt: null,
        occupations: (input.occupationIds ?? []).flatMap((id) =>
          allOccupations.filter((a) => a.id === id),
        ),
      };
      clients = [...clients, created];
      return respond({ createClient: created });
    }

    if (operationName === "UpdateClient") {
      const input = variables?.["input"] as
        (Partial<MockClient> & { id: number }) | undefined;
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
        (Partial<MockContact> & { id: number }) | undefined;
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

test("Company name filters the Clients list", async ({ page }) => {
  await mockClientsApi(page, [
    makeClient({ id: 1, name: "Acme Corp" }),
    makeClient({ id: 2, name: "Globex Inc" }),
  ]);
  await page.goto("/clients");

  await expect(page.getByText("Acme Corp")).toBeVisible();
  await expect(page.getByText("Globex Inc")).toBeVisible();

  await page.getByLabel("Company name").fill("acme");

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

test("creates a client with an occupation selected, and it persists to the detail page", async ({
  page,
}) => {
  await mockClientsApi(page, []);
  await page.goto("/clients");

  await page.getByRole("button", { name: "New client" }).click();
  await page.getByLabel("Company name *").fill("Brand New Co");
  await page.getByRole("button", { name: "+ occupation" }).click();
  await page.getByRole("option", { name: "Translation" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await page.getByRole("button", { name: "Create client" }).click();

  await expect(page.getByText("Brand New Co")).toBeVisible();
  await page.getByText("Brand New Co").click();

  await expect(page.getByText("Translation")).toBeVisible();
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

test("the industry filter narrows the Clients list", async ({ page }) => {
  await mockClientsApi(page, [
    makeClient({ id: 1, name: "Law Firm", industry: "LEGAL" }),
    makeClient({ id: 2, name: "Game Studio", industry: "VIDEO_GAMES" }),
  ]);
  await page.goto("/clients");
  await expect(page.getByText("Game Studio")).toBeVisible();

  await page.getByRole("combobox", { name: "Industry" }).click();
  await page.getByRole("option", { name: "Legal" }).click();

  await expect(page.getByText("Law Firm")).toBeVisible();
  await expect(page.getByText("Game Studio")).not.toBeVisible();
});

test("adding a LinkedIn URL in the client edit form shows a LinkedIn link", async ({
  page,
}) => {
  await mockClientsApi(page, [makeClient({ id: 5, name: "Acme Corp" })]);
  await page.goto("/clients/5");

  await page.getByText("Edit").click();
  await page
    .getByLabel("LinkedIn")
    .fill("https://www.linkedin.com/company/acme");
  await page.getByText("Save").click();

  await expect(page.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
    "href",
    "https://www.linkedin.com/company/acme",
  );
});

test("the Individuals tab filters people by last and first name", async ({
  page,
}) => {
  const person = (id: number, firstName: string, lastName: string) =>
    makeClient({
      id,
      name: `${firstName} ${lastName}`,
      clientType: "INDIVIDUAL",
      firstName,
      lastName,
    });
  await mockClientsApi(page, [
    person(1, "Marie", "Curie"),
    person(2, "Pierre", "Curie"),
    person(3, "Marie", "Dupont"),
  ]);
  await page.goto("/clients");

  await page.getByRole("tab", { name: "Individuals" }).click();
  await page.getByLabel("Last name").fill("curie");
  await page.getByLabel("First name").fill("marie");

  await expect(page.getByText("Marie Curie")).toBeVisible();
  await expect(page.getByText("Pierre Curie")).not.toBeVisible();
  await expect(page.getByText("Marie Dupont")).not.toBeVisible();
});

test("the Clients list sorts by company name, A to Z then Z to A", async ({
  page,
}) => {
  await mockClientsApi(page, [
    makeClient({ id: 1, name: "Beta" }),
    makeClient({ id: 2, name: "Alpha" }),
    makeClient({ id: 3, name: "Gamma" }),
  ]);
  await page.goto("/clients");
  const names = page.getByText(/^(Alpha|Beta|Gamma)$/);

  await expect(names).toHaveText(["Alpha", "Beta", "Gamma"]);
  await page.getByLabel("Order").click();
  await page.getByRole("option", { name: "Descending" }).click();
  await expect(names).toHaveText(["Gamma", "Beta", "Alpha"]);
});
