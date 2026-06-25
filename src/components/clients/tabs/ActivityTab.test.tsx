import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { Invoice } from "@/types/invoices.types";
import { ActivityTab } from "./ActivityTab";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigateMock };
});

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: 1,
    userId: 1,
    clientId: 1,
    number: "INV-0001",
    status: "DRAFT",
    currency: "EUR",
    issuedAt: null,
    dueDate: null,
    paidAt: null,
    notes: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    items: [],
    ...overrides,
  };
}

function renderTab(props: Partial<Parameters<typeof ActivityTab>[0]> = {}) {
  return render(
    <MemoryRouter>
      <ActivityTab
        invoices={[]}
        invoicesLoading={false}
        totalSeconds={0}
        timeLoading={false}
        hasProjects={true}
        {...props}
      />
    </MemoryRouter>,
  );
}

describe("ActivityTab", () => {
  it("shows an empty state when there are no invoices", () => {
    renderTab();
    expect(screen.getByText("No invoices yet.")).toBeInTheDocument();
  });

  it("renders invoice rows when invoices exist", () => {
    renderTab({ invoices: [makeInvoice({ number: "INV-0042" })] });
    expect(screen.getByText("INV-0042")).toBeInTheDocument();
  });

  it("shows 'No projects linked' when the client has no projects", () => {
    renderTab({ hasProjects: false, totalSeconds: 0 });
    expect(screen.getByText("No projects linked.")).toBeInTheDocument();
  });

  it("shows 'No time logged' when there are projects but zero seconds", () => {
    renderTab({ hasProjects: true, totalSeconds: 0 });
    expect(screen.getByText("No time logged.")).toBeInTheDocument();
  });

  it("shows the formatted duration when time has been logged", () => {
    renderTab({ hasProjects: true, totalSeconds: 5400 });
    expect(screen.getByText("1h 30m")).toBeInTheDocument();
  });
});
