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
import { IntlProvider } from "react-intl";
import { messages } from "@/i18n/messages";
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

let occupationChipsProps: Record<string, unknown> = {};
vi.mock("@/components/occupations/OccupationChips", () => ({
  OccupationChips: (props: Record<string, unknown>) => {
    occupationChipsProps = props;
    return <div data-testid="occupation-chips" />;
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
    addressLine2: null,
    city: null,
    country: null,
    state: null,
    postalCode: null,
    vatNumber: null,
    legalForm: null,
    color: null,
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

function renderHeader(
  client: Client,
  onUpdate = vi.fn(),
  saving = false,
  locale: "en" | "fr" = "en",
) {
  gqlFetch.mockResolvedValue({ tags: [] });
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <IntlProvider locale={locale} messages={messages[locale]}>
        <ClientHeader client={client} onUpdate={onUpdate} saving={saving} />
      </IntlProvider>
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
          firstName: null,
          lastName: null,
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

  it("shows the recontact date in view mode when set", () => {
    renderHeader(makeClient({ toRecontactAt: "2026-11-02T12:00:00.000Z" }));
    expect(screen.getByText("To recontact on: 11/2/2026")).toBeInTheDocument();
  });

  it("hides the recontact line when there is no recontact date", () => {
    renderHeader(makeClient({ toRecontactAt: null }));
    expect(screen.queryByText(/To recontact on:/)).not.toBeInTheDocument();
  });

  it("edit form pre-fills the recontact date input", () => {
    renderHeader(makeClient({ toRecontactAt: "2026-11-02T00:00:00.000Z" }));
    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByLabelText("To recontact at")).toHaveValue("2026-11-02");
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

  it("can mark a client as a former client", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    renderHeader(makeClient({ id: 5, status: "CLIENT" }), onUpdate);

    fireEvent.click(screen.getByText("Edit"));
    fireEvent.click(document.getElementById("cl-status")!);
    fireEvent.click(
      await screen.findByRole("option", { name: "Former client" }),
    );
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 5, status: "FORMER_CLIENT" }),
      ),
    );
  });

  it("opens Edit with the client as it is now, so a save never sends back a stale status", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    gqlFetch.mockResolvedValue({ tags: [] });
    const queryClient = createQueryClient();
    const view = (client: Client) => (
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale="en" messages={messages.en}>
          <ClientHeader client={client} onUpdate={onUpdate} saving={false} />
        </IntlProvider>
      </QueryClientProvider>
    );
    const { rerender } = render(
      view(makeClient({ id: 5, status: "FORMER_CLIENT" })),
    );

    // The server stepped the status after a contact-date save.
    rerender(view(makeClient({ id: 5, status: "CONTACTED" })));
    fireEvent.click(screen.getByText("Edit"));
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 5, status: "CONTACTED" }),
      ),
    );
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
          contactedAt: "2026-06-10",
        }),
      ),
    );
  });

  it("saves the recontact date typed in the edit form", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    renderHeader(makeClient({ id: 5 }), onUpdate);

    fireEvent.click(screen.getByText("Edit"));
    fireEvent.change(screen.getByLabelText("To recontact at"), {
      target: { value: "2026-11-02" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 5, toRecontactAt: "2026-11-02" }),
      ),
    );
  });

  it("clearing an optional field sends null so the stored value is erased", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    renderHeader(
      makeClient({ id: 5, email: "a@b.com", notes: "old" }),
      onUpdate,
    );

    fireEvent.click(screen.getByText("Edit"));
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "" } });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 5, email: null }),
      ),
    );
  });

  it("switching a company to an individual erases the company-only fields", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    renderHeader(
      makeClient({
        id: 5,
        legalName: "Acme SAS",
        vatNumber: "FR123",
        legalForm: "SAS",
      }),
      onUpdate,
    );

    fireEvent.click(screen.getByText("Edit"));
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Individual" }));
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          clientType: "INDIVIDUAL",
          legalName: null,
          vatNumber: null,
          legalForm: null,
        }),
      ),
    );
  });

  it("clearing the contacted-at date sends null", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    renderHeader(
      makeClient({ id: 5, contactedAt: "2026-06-01T00:00:00.000Z" }),
      onUpdate,
    );

    fireEvent.click(screen.getByText("Edit"));
    fireEvent.change(screen.getByLabelText("Contacted At"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ contactedAt: null }),
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

  it("shows the LinkedIn URL as a LinkedIn link opening a new tab", () => {
    renderHeader(
      makeClient({ linkedinUrl: "https://www.linkedin.com/company/acme" }),
    );
    const link = screen.getByRole("link", { name: "LinkedIn" });
    expect(link).toHaveAttribute(
      "href",
      "https://www.linkedin.com/company/acme",
    );
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("shows no LinkedIn link when there is none or it is not a web address", () => {
    renderHeader(makeClient({ linkedinUrl: "javascript:alert(1)" }));
    expect(screen.queryByRole("link", { name: "LinkedIn" })).toBeNull();
  });

  it("edits the LinkedIn URL under Website, checking it is a web address", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    renderHeader(makeClient({ id: 5 }), onUpdate);
    fireEvent.click(screen.getByText("Edit"));
    const input = screen.getByLabelText("LinkedIn");

    fireEvent.change(input, { target: { value: "linkedin acme" } });
    // No complaint while typing; Save shows why it refuses.
    expect(screen.queryByText("Enter a valid URL.")).toBeNull();
    fireEvent.click(screen.getByText("Save"));
    expect(screen.getByText("Enter a valid URL.")).toBeInTheDocument();
    expect(onUpdate).not.toHaveBeenCalled();

    fireEvent.change(input, {
      target: { value: "https://www.linkedin.com/company/acme" },
    });
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 5,
          linkedinUrl: "https://www.linkedin.com/company/acme",
        }),
      ),
    );
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
        <IntlProvider locale="en" messages={messages.en}>
          <ClientHeader
            client={makeClient()}
            onUpdate={vi.fn()}
            saving={true}
          />
        </IntlProvider>
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
    expect(screen.getByLabelText("Address line 2")).toBeInTheDocument();
    expect(screen.getByLabelText("City")).toBeInTheDocument();
    expect(screen.getByLabelText("State / Province")).toBeInTheDocument();
    expect(screen.getByLabelText("Postal code")).toBeInTheDocument();
    expect(screen.getByLabelText("Country")).toBeInTheDocument();
  });

  it("edit form shows Legal form, Color, and Notes inputs for a COMPANY client", () => {
    renderHeader(makeClient());
    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByLabelText("Legal form")).toBeInTheDocument();
    expect(screen.getByLabelText("Color")).toBeInTheDocument();
    expect(screen.getByLabelText("Notes")).toBeInTheDocument();
  });

  it("edit form pre-fills legalForm, addressLine2, state, color, and notes", () => {
    renderHeader(
      makeClient({
        legalForm: "SAS",
        addressLine2: "Suite 200",
        state: "Quebec",
        color: "#D2D5DA",
        notes: "Prefers email contact",
      }),
    );
    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByLabelText("Legal form")).toHaveValue("SAS");
    expect(screen.getByLabelText("Address line 2")).toHaveValue("Suite 200");
    expect(screen.getByLabelText("State / Province")).toHaveValue("Quebec");
    expect(screen.getByLabelText("Color")).toHaveValue("#D2D5DA");
    expect(screen.getByLabelText("Notes")).toHaveValue("Prefers email contact");
  });

  it("saves edited legalForm, addressLine2, state, color, and notes", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    renderHeader(makeClient({ id: 5 }), onUpdate);

    fireEvent.click(screen.getByText("Edit"));
    fireEvent.change(screen.getByLabelText("Legal form"), {
      target: { value: "SAS" },
    });
    fireEvent.change(screen.getByLabelText("Address line 2"), {
      target: { value: "Suite 200" },
    });
    fireEvent.change(screen.getByLabelText("State / Province"), {
      target: { value: "Quebec" },
    });
    fireEvent.change(screen.getByLabelText("Color"), {
      target: { value: "#D2D5DA" },
    });
    fireEvent.change(screen.getByLabelText("Notes"), {
      target: { value: "Prefers email contact" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 5,
          legalForm: "SAS",
          addressLine2: "Suite 200",
          state: "Quebec",
          color: "#D2D5DA",
          notes: "Prefers email contact",
        }),
      ),
    );
  });

  it("shows addressLine2, state, legalForm, and notes in view mode", () => {
    renderHeader(
      makeClient({
        address: "12 Rue de Rivoli",
        addressLine2: "Suite 200",
        state: "Île-de-France",
        legalForm: "SAS",
        notes: "Prefers email contact",
      }),
    );
    expect(screen.getByText("Suite 200")).toBeInTheDocument();
    expect(screen.getByText(/Île-de-France/)).toBeInTheDocument();
    expect(screen.getByText("SAS")).toBeInTheDocument();
    expect(screen.getByText("Prefers email contact")).toBeInTheDocument();
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

  it("wires tag chip onChange to the edit form's tagIds", () => {
    renderHeader(makeClient({ tags: [{ id: 1, name: "VIP" }] }));
    fireEvent.click(screen.getByText("Edit"));
    expect(tagChipsProps.tagIds).toEqual([1]);

    act(() => (tagChipsProps.onChange as (ids: number[]) => void)([2]));
    expect(tagChipsProps.tagIds).toEqual([2]);
  });

  it("wires occupation chip onChange to the edit form's occupationIds, seeded from client.occupations", () => {
    renderHeader(
      makeClient({
        occupations: [
          { id: 1, name: "Translation", occupationType: "TRANSLATOR" },
        ],
      }),
    );
    fireEvent.click(screen.getByText("Edit"));
    expect(occupationChipsProps.occupationIds).toEqual([1]);

    act(() =>
      (occupationChipsProps.onChange as (ids: number[]) => void)([1, 2]),
    );
    expect(occupationChipsProps.occupationIds).toEqual([1, 2]);
  });

  it("saves the edited occupationIds", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    renderHeader(makeClient(), onUpdate);
    fireEvent.click(screen.getByText("Edit"));

    act(() =>
      (occupationChipsProps.onChange as (ids: number[]) => void)([3, 4]),
    );
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ occupationIds: [3, 4] }),
      ),
    );
  });

  it("shows occupation badges in view mode when the client has occupations", () => {
    renderHeader(
      makeClient({
        occupations: [
          { id: 1, name: "Translation", occupationType: "TRANSLATOR" },
        ],
      }),
    );
    expect(screen.getByText("Translation")).toBeInTheDocument();
  });

  it("renders French copy when locale is fr", () => {
    renderHeader(makeClient({ paymentDelayDays: 30 }), vi.fn(), false, "fr");

    expect(screen.getByText("Modifier")).toBeInTheDocument();
    expect(
      screen.getByText("Entreprise", { selector: "span" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Facturation")).toBeInTheDocument();
    expect(screen.getByText("Paiement : 30 jours")).toBeInTheDocument();
  });
});
