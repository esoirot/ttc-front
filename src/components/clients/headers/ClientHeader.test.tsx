import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { Client } from "@/types/clients.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

let tagChipsProps: Record<string, unknown> = {};
vi.mock("@/components/time/tags/TtcTagChips", () => ({
  TtcTagChips: (props: Record<string, unknown>) => {
    tagChipsProps = props;
    return <div data-testid="tag-chips" />;
  },
}));

import { ClientHeader } from "./ClientHeader";

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
    status: "CLIENT",
    contactedAt: null,
    tags: [],
    contacts: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as Client;
}

function renderHeader(client: Client, onUpdate = vi.fn(), saving = false) {
  gqlFetch.mockResolvedValue({ tags: [] });
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <ClientHeader client={client} onUpdate={onUpdate} saving={saving} />
    </QueryClientProvider>,
  );
}

describe("ClientHeader", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("shows the client name and Company badge in view mode", () => {
    renderHeader(makeClient());

    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(
      screen.getByText("Company", { selector: "span" }),
    ).toBeInTheDocument();
  });

  it("hides the billing section when no billing fields are set", () => {
    renderHeader(makeClient());
    expect(screen.queryByText("Billing")).not.toBeInTheDocument();
  });

  it("shows the billing section when a billing field is set", () => {
    renderHeader(makeClient({ paymentDelayDays: 30 }));
    expect(screen.getByText("Billing")).toBeInTheDocument();
    expect(screen.getByText("Payment: 30 days")).toBeInTheDocument();
  });

  it("switches to the edit form pre-filled from the client", () => {
    renderHeader(makeClient({ email: "a@b.com" }));

    fireEvent.click(screen.getByText("Edit"));

    expect(screen.getByLabelText("Name")).toHaveValue("Acme");
    expect(screen.getByLabelText("Email")).toHaveValue("a@b.com");
  });

  it("saves company fields and exits edit mode", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    renderHeader(makeClient({ id: 5 }), onUpdate);

    fireEvent.click(screen.getByText("Edit"));
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Acme Renamed" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 5,
          clientType: "COMPANY",
          name: "Acme Renamed",
          firstName: undefined,
          lastName: undefined,
        }),
      ),
    );
    await waitFor(() =>
      expect(screen.queryByLabelText("Name")).not.toBeInTheDocument(),
    );
  });

  it("cancel discards edits and returns to view mode without saving", () => {
    const onUpdate = vi.fn();
    renderHeader(makeClient(), onUpdate);

    fireEvent.click(screen.getByText("Edit"));
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Changed" },
    });
    fireEvent.click(screen.getByText("Cancel"));

    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.getByText("Acme")).toBeInTheDocument();
  });

  it("shows the status badge in view mode", () => {
    renderHeader(makeClient({ status: "TALKING" }));
    expect(screen.getByText("Talking")).toBeInTheDocument();
  });

  it("shows the last contacted date in view mode when contactedAt is set", () => {
    renderHeader(
      makeClient({
        status: "TALKING",
        contactedAt: "2026-06-01T00:00:00.000Z",
      }),
    );
    expect(screen.getByText(/Last contacted:/)).toBeInTheDocument();
  });

  it("hides the last contacted line when contactedAt is null", () => {
    renderHeader(makeClient({ contactedAt: null }));
    expect(screen.queryByText(/Last contacted:/)).not.toBeInTheDocument();
  });

  it("edit form pre-fills the status select and contacted-at date input", () => {
    renderHeader(
      makeClient({
        status: "TALKING",
        contactedAt: "2026-06-01T00:00:00.000Z",
      }),
    );

    fireEvent.click(screen.getByText("Edit"));

    expect(screen.getByLabelText("Contacted At")).toHaveValue("2026-06-01");
    expect(
      screen.getByText("Talking", { selector: "span" }),
    ).toBeInTheDocument();
  });

  it("saves a contactedAt change while preserving the current status", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    renderHeader(makeClient({ id: 5, status: "FOLLOW_UP_2" }), onUpdate);

    fireEvent.click(screen.getByText("Edit"));
    fireEvent.change(screen.getByLabelText("Contacted At"), {
      target: { value: "2026-06-10" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 5,
          status: "FOLLOW_UP_2",
          contactedAt: "2026-06-10T00:00:00",
        }),
      ),
    );
  });

  it("shows Individual badge for INDIVIDUAL client", () => {
    renderHeader(makeClient({ clientType: "INDIVIDUAL" }));
    expect(
      screen.getByText("Individual", { selector: "span" }),
    ).toBeInTheDocument();
  });

  it("shows HubSpot linked badge when hubspotId is set", () => {
    renderHeader(makeClient({ hubspotId: "hs-abc123" }));
    expect(screen.getByText("HubSpot linked")).toBeInTheDocument();
  });

  it("shows legalName when it differs from the client name", () => {
    renderHeader(makeClient({ name: "Acme Ltd", legalName: "Acme Limited" }));
    expect(screen.getByText("Acme Limited")).toBeInTheDocument();
  });

  it("hides legalName when it matches the client name", () => {
    renderHeader(makeClient({ name: "Acme", legalName: "Acme" }));
    expect(screen.getAllByText("Acme")).toHaveLength(1);
  });

  it("shows email in view mode", () => {
    renderHeader(makeClient({ email: "contact@acme.com" }));
    expect(screen.getByText("contact@acme.com")).toBeInTheDocument();
  });

  it("shows phone in view mode", () => {
    renderHeader(makeClient({ phone: "+33 1 00 00 00 00" }));
    expect(screen.getByText("+33 1 00 00 00 00")).toBeInTheDocument();
  });

  it("shows website as a link in view mode", () => {
    renderHeader(makeClient({ website: "https://acme.com" }));
    const link = screen.getByRole("link", { name: "https://acme.com" });
    expect(link).toHaveAttribute("href", "https://acme.com");
  });

  it("shows VAT number for a company client", () => {
    renderHeader(makeClient({ vatNumber: "FR00123456789" }));
    expect(screen.getByText("VAT FR00123456789")).toBeInTheDocument();
  });

  it("shows industry badge in view mode", () => {
    renderHeader(makeClient({ industry: "LEGAL" }));
    expect(screen.getByText("Legal")).toBeInTheDocument();
  });

  it("shows tag badges in view mode", () => {
    renderHeader(
      makeClient({
        tags: [
          { id: 1, name: "VIP" },
          { id: 2, name: "Urgent" },
        ],
      }),
    );
    expect(screen.getByText("VIP")).toBeInTheDocument();
    expect(screen.getByText("Urgent")).toBeInTheDocument();
  });

  it("shows First name and Last name inputs in edit mode for INDIVIDUAL client", () => {
    renderHeader(makeClient({ clientType: "INDIVIDUAL" }));
    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByLabelText("First name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last name")).toBeInTheDocument();
  });

  it("shows Saving… and disables Save while saving=true in edit mode", () => {
    const { rerender } = renderHeader(makeClient());
    fireEvent.click(screen.getByText("Edit"));
    rerender(
      <QueryClientProvider client={createQueryClient()}>
        <ClientHeader client={makeClient()} onUpdate={vi.fn()} saving={true} />
      </QueryClientProvider>,
    );
    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
  });

  it("shows tax rate in the billing section", () => {
    renderHeader(makeClient({ taxRate: 20 }));
    expect(screen.getByText("Tax: 20%")).toBeInTheDocument();
  });

  it("shows End of month indicator in the billing section", () => {
    renderHeader(makeClient({ paymentDelayDays: 30, billingEndOfMonth: true }));
    expect(screen.getByText("End of month")).toBeInTheDocument();
  });

  it("shows the full city/postal/country location line in view mode", () => {
    renderHeader(
      makeClient({ postalCode: "75001", city: "Paris", country: "France" }),
    );
    expect(screen.getByText("75001, Paris, France")).toBeInTheDocument();
  });

  it("shows the street address in view mode when client.address is set", () => {
    renderHeader(makeClient({ address: "12 Rue de Rivoli" }));
    expect(screen.getByText("12 Rue de Rivoli")).toBeInTheDocument();
  });

  it("shows city and country without postalCode when postalCode is null", () => {
    renderHeader(
      makeClient({ city: "Paris", country: "France", postalCode: null }),
    );
    expect(screen.getByText("Paris, France")).toBeInTheDocument();
  });

  it("edit form pre-fills the website input from the client", () => {
    renderHeader(makeClient({ website: "https://acme.com" }));
    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByLabelText("Website")).toHaveValue("https://acme.com");
  });

  it("edit form pre-fills Legal name and VAT number for COMPANY client", () => {
    renderHeader(
      makeClient({ legalName: "Acme Limited", vatNumber: "FR00123456789" }),
    );
    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByLabelText("Legal name")).toHaveValue("Acme Limited");
    expect(screen.getByLabelText("VAT number")).toHaveValue("FR00123456789");
  });

  it("edit form pre-fills firstName and lastName for INDIVIDUAL client", () => {
    renderHeader(
      makeClient({
        clientType: "INDIVIDUAL",
        firstName: "Jane",
        lastName: "Doe",
      }),
    );
    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByLabelText("First name")).toHaveValue("Jane");
    expect(screen.getByLabelText("Last name")).toHaveValue("Doe");
  });

  it("saves INDIVIDUAL client with clientType, firstName, and lastName", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    renderHeader(
      makeClient({
        id: 7,
        clientType: "INDIVIDUAL",
        firstName: "Jane",
        lastName: "Doe",
      }),
      onUpdate,
    );
    fireEvent.click(screen.getByText("Edit"));
    fireEvent.change(screen.getByLabelText("First name"), {
      target: { value: "Janet" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 7,
          clientType: "INDIVIDUAL",
          firstName: "Janet",
          lastName: "Doe",
        }),
      ),
    );
  });

  it("edit form shows address inputs", () => {
    renderHeader(makeClient());
    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByLabelText("Address")).toBeInTheDocument();
    expect(screen.getByLabelText("City")).toBeInTheDocument();
    expect(screen.getByLabelText("Postal code")).toBeInTheDocument();
    expect(screen.getByLabelText("Country")).toBeInTheDocument();
  });

  it("saves edited legalName, vatNumber, website, email, and phone", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    renderHeader(makeClient({ id: 5 }), onUpdate);

    fireEvent.click(screen.getByText("Edit"));
    fireEvent.change(screen.getByLabelText("Legal name"), {
      target: { value: "Acme Limited" },
    });
    fireEvent.change(screen.getByLabelText("VAT number"), {
      target: { value: "FR00123456789" },
    });
    fireEvent.change(screen.getByLabelText("Website"), {
      target: { value: "https://acme.com" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "hello@acme.com" },
    });
    fireEvent.change(screen.getByLabelText("Phone"), {
      target: { value: "+33 1 00 00 00 00" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 5,
          legalName: "Acme Limited",
          vatNumber: "FR00123456789",
          website: "https://acme.com",
          email: "hello@acme.com",
          phone: "+33 1 00 00 00 00",
        }),
      ),
    );
  });

  it("switching the clientType tab in edit mode toggles the fields shown", () => {
    renderHeader(makeClient());
    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByLabelText("Name")).toBeInTheDocument();

    const trigger = screen.getByText("Individual");
    fireEvent.mouseDown(trigger);
    trigger.focus();
    fireEvent.click(trigger);

    expect(screen.getByLabelText("First name")).toBeInTheDocument();
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
  });

  it("wires tag chip add/remove to the edit form's tagIds", () => {
    renderHeader(makeClient({ tags: [{ id: 1, name: "VIP" }] }));
    fireEvent.click(screen.getByText("Edit"));
    expect(tagChipsProps.tagIds).toEqual([1]);

    act(() => (tagChipsProps.onAdd as (id: number) => void)(2));
    expect(tagChipsProps.tagIds).toEqual([1, 2]);

    act(() => (tagChipsProps.onRemove as (id: number) => void)(1));
    expect(tagChipsProps.tagIds).toEqual([2]);
  });
});
