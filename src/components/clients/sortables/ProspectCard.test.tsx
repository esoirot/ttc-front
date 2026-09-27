import { fireEvent, render, screen } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { MemoryRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/useLocale";
import type { Client } from "@/types/clients.types";
import { ProspectCard } from "./ProspectCard";

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
    status: "TO_CONTACT",
    contactedAt: null,
    tags: [],
    contacts: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as Client;
}

function renderCard(client: Client, onDelete = vi.fn(), locale: Locale = "en") {
  return render(
    <IntlProvider locale={locale} messages={messages[locale]}>
      <MemoryRouter>
        <DndContext>
          <SortableContext items={[client.id]}>
            <ProspectCard client={client} onDelete={onDelete} />
          </SortableContext>
        </DndContext>
      </MemoryRouter>
    </IntlProvider>,
  );
}

describe("ProspectCard", () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  it("renders the client name", () => {
    renderCard(makeClient({ name: "Acme Prospect" }));
    expect(screen.getByText("Acme Prospect")).toBeInTheDocument();
  });

  it("shows an em dash when contactedAt is not set", () => {
    renderCard(makeClient({ contactedAt: null }));
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows the formatted contactedAt date when set", () => {
    renderCard(makeClient({ contactedAt: "2026-06-01T00:00:00.000Z" }));
    expect(
      screen.getByText(
        new Date("2026-06-01T00:00:00.000Z").toLocaleDateString(),
      ),
    ).toBeInTheDocument();
  });

  it("shows a color swatch when the prospect has a color", () => {
    // given a prospect with a color
    renderCard(makeClient({ color: "#ff0000" }));

    // then its swatch is rendered in that color
    expect(screen.getByTestId("client-color-swatch")).toHaveStyle({
      backgroundColor: "#ff0000",
    });
  });

  it("shows no color swatch when the prospect has no color", () => {
    // given a prospect without a color
    renderCard(makeClient({ color: null }));

    // then no swatch is rendered
    expect(screen.queryByTestId("client-color-swatch")).not.toBeInTheDocument();
  });

  it("navigates to the client detail page when the card is clicked", () => {
    renderCard(makeClient({ id: 7, name: "Acme" }));
    fireEvent.click(screen.getByText("Acme"));
    expect(navigateMock).toHaveBeenCalledWith("/clients/7");
  });

  it("opens a confirm dialog and calls onDelete on confirm", () => {
    const onDelete = vi.fn();
    renderCard(makeClient({ id: 3, name: "Acme" }), onDelete);

    fireEvent.click(screen.getByLabelText("Delete prospect"));
    expect(screen.getByText("Delete prospect?")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Delete"));
    expect(onDelete).toHaveBeenCalledWith(3);
  });

  it("renders French copy when locale is fr", () => {
    renderCard(makeClient({ id: 3, name: "Acme" }), vi.fn(), "fr");
    fireEvent.click(screen.getByLabelText("Supprimer le prospect"));
    expect(screen.getByText("Supprimer le prospect ?")).toBeInTheDocument();
  });
});
