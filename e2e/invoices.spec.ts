import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { MOCK_USER } from "./helpers/mock";

const NOW = "2026-01-01T00:00:00.000Z";

type MockInvoice = {
  id: number;
  userId: number;
  clientId: number | null;
  number: string;
  status: string;
  currency: string;
  issuedAt: string | null;
  dueDate: string | null;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: unknown[];
};

function makeInvoice(overrides: Partial<MockInvoice> = {}): MockInvoice {
  return {
    id: 1,
    userId: 1,
    clientId: null,
    number: "INV-0001",
    status: "DRAFT",
    currency: "EUR",
    issuedAt: null,
    dueDate: null,
    paidAt: null,
    notes: null,
    createdAt: NOW,
    updatedAt: NOW,
    items: [],
    ...overrides,
  };
}

// Mocks /graphql for the InvoiceDetail page: InvoiceMetaCard's edit form
// pulls in Clients, the header pulls the current user (logo), and the page
// updates via a single UpdateInvoice mutation backed by a mutable array.
async function mockInvoicesApi(page: Page, initial: MockInvoice[]) {
  let invoices = initial.map((i) => ({ ...i }));

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

    if (operationName === "Invoice") {
      const id = variables?.["id"] as number;
      return respond({ invoice: invoices.find((i) => i.id === id) ?? null });
    }

    if (operationName === "UpdateInvoice") {
      const input = variables?.["input"] as
        (Partial<MockInvoice> & { id: number }) | undefined;
      invoices = invoices.map((i) =>
        i.id === input?.id ? { ...i, ...input } : i,
      );
      const updated = invoices.find((i) => i.id === input?.id);
      return respond({ updateInvoice: updated });
    }

    if (operationName === "Clients") {
      return respond({ clients: { items: [], nextCursor: null, total: 0 } });
    }

    return respond(null);
  });
}

test("InvoiceMetaCard Edit -> change notes -> Save persists the new value", async ({
  page,
}) => {
  await mockInvoicesApi(page, [makeInvoice({ id: 9, number: "INV-0009" })]);
  await page.goto("/invoices/9");

  await expect(page.getByText("INV-0009")).toBeVisible();
  await page.getByRole("button", { name: "Edit" }).click();
  await page
    .getByPlaceholder("Internal notes…")
    .fill("Client requested rush delivery");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText("Client requested rush delivery")).toBeVisible();
});
