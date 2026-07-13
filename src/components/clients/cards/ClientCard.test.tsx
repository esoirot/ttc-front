import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Client } from "@/types/clients.types";
import { ClientCard } from "./ClientCard";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigateMock };
});

function makeClient(overrides: Partial<Client> = {}): Client {
  return {
    id: 1,
    userId: 1,
    name: "Acme",
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
    ...overrides,
  } as Client;
}

describe("ClientCard", () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  it("renders the client name and a Company badge", () => {
    render(<ClientCard client={makeClient()} onDelete={vi.fn()} />);

    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Company")).toBeInTheDocument();
  });

  it("shows Individual badge for non-company clients", () => {
    render(
      <ClientCard
        client={makeClient({ clientType: "INDIVIDUAL" })}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("Individual")).toBeInTheDocument();
  });

  it("shows legalName only when it differs from name", () => {
    const { rerender } = render(
      <ClientCard
        client={makeClient({ legalName: "Acme Corp Ltd" })}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("Acme Corp Ltd")).toBeInTheDocument();

    rerender(
      <ClientCard
        client={makeClient({ legalName: "Acme" })}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.queryByText("Acme Corp Ltd")).not.toBeInTheDocument();
  });

  it("navigates to the client detail page when the card is clicked", () => {
    render(<ClientCard client={makeClient({ id: 7 })} onDelete={vi.fn()} />);

    fireEvent.click(screen.getByText("Acme"));

    expect(navigateMock).toHaveBeenCalledWith("/clients/7");
  });

  it("shows a count badge for 2+ contacts and a +N badge for extra tags", () => {
    render(
      <ClientCard
        client={makeClient({
          contacts: [
            {
              id: 1,
              clientId: 1,
              firstName: "A",
              lastName: null,
              email: null,
              phone: null,
              jobTitle: null,
              color: null,
              createdAt: "",
              updatedAt: "",
            },
            {
              id: 2,
              clientId: 1,
              firstName: "B",
              lastName: null,
              email: null,
              phone: null,
              jobTitle: null,
              color: null,
              createdAt: "",
              updatedAt: "",
            },
          ],
          tags: [
            { id: 1, name: "VIP" },
            { id: 2, name: "Urgent" },
            { id: 3, name: "Long-term" },
          ],
        })}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("2 contacts")).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("calls onDelete with the client id after confirming the delete dialog", () => {
    const onDelete = vi.fn();
    render(<ClientCard client={makeClient({ id: 3 })} onDelete={onDelete} />);

    fireEvent.click(screen.getByText("✕"));
    fireEvent.click(screen.getByText("Delete"));

    expect(onDelete).toHaveBeenCalledWith(3);
  });

  it("does not navigate to the (now-deleted) client's detail page after confirming delete", () => {
    const onDelete = vi.fn();
    render(<ClientCard client={makeClient({ id: 3 })} onDelete={onDelete} />);

    fireEvent.click(screen.getByText("✕"));
    fireEvent.click(screen.getByText("Delete"));

    expect(navigateMock).not.toHaveBeenCalled();
  });
});
