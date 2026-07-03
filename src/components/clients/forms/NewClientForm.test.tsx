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

import { NewClientForm } from "./NewClientForm";

function renderForm(
  onClose = vi.fn(),
  props: { defaultStatus?: "TO_CONTACT"; title?: string } = {},
) {
  gqlFetch.mockResolvedValue({ tags: [] });
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <NewClientForm onClose={onClose} {...props} />
    </QueryClientProvider>,
  );
}

describe("NewClientForm", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("shows company fields by default", () => {
    renderForm();
    expect(screen.getByLabelText("Company name *")).toBeInTheDocument();
  });

  it("switches to individual fields", () => {
    renderForm();

    const trigger = screen.getByText("Individual");
    fireEvent.mouseDown(trigger);
    trigger.focus();
    fireEvent.click(trigger);

    expect(screen.getByLabelText("First name *")).toBeInTheDocument();
  });

  it("shows a validation error and does not submit when the company name is blank", async () => {
    renderForm();

    fireEvent.click(screen.getByText("Create client"));

    expect(
      await screen.findByText("Company name is required"),
    ).toBeInTheDocument();
    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("creates the client and closes the form on success", async () => {
    gqlMutate.mockResolvedValueOnce({ createClient: { id: 9, name: "Acme" } });
    const onClose = vi.fn();
    renderForm(onClose);

    fireEvent.change(screen.getByLabelText("Company name *"), {
      target: { value: "Acme" },
    });
    fireEvent.click(screen.getByText("Create client"));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(gqlMutate.mock.calls[0][1]).toMatchObject({
      input: { clientType: "COMPANY", name: "Acme" },
    });
  });

  it("omits status from the payload when no defaultStatus is given (server defaults to CLIENT)", async () => {
    gqlMutate.mockResolvedValueOnce({ createClient: { id: 9, name: "Acme" } });
    renderForm();

    fireEvent.change(screen.getByLabelText("Company name *"), {
      target: { value: "Acme" },
    });
    fireEvent.click(screen.getByText("Create client"));

    await waitFor(() => expect(gqlMutate).toHaveBeenCalled());
    const input = gqlMutate.mock.calls[0][1] as { input: { status?: string } };
    expect(input.input.status).toBeUndefined();
  });

  it("includes defaultStatus in the create payload when provided", async () => {
    gqlMutate.mockResolvedValueOnce({ createClient: { id: 9, name: "Acme" } });
    renderForm(vi.fn(), { defaultStatus: "TO_CONTACT" });

    fireEvent.change(screen.getByLabelText("Company name *"), {
      target: { value: "Acme" },
    });
    fireEvent.click(screen.getByText("Create client"));

    await waitFor(() => expect(gqlMutate).toHaveBeenCalled());
    expect(gqlMutate.mock.calls[0][1]).toMatchObject({
      input: { status: "TO_CONTACT" },
    });
  });

  it("shows a custom title when provided", () => {
    renderForm(vi.fn(), { title: "New prospect" });
    expect(screen.getByText("New prospect")).toBeInTheDocument();
  });

  it("shows the default title when none is provided", () => {
    renderForm();
    expect(screen.getByText("New client")).toBeInTheDocument();
  });

  it("shows 'First name is required' and does not submit when first name is blank in individual mode", async () => {
    renderForm();
    const trigger = screen.getByText("Individual");
    fireEvent.mouseDown(trigger);
    trigger.focus();
    fireEvent.click(trigger);

    fireEvent.click(screen.getByText("Create client"));

    expect(
      await screen.findByText("First name is required"),
    ).toBeInTheDocument();
    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("shows Creating… and disables the submit button while the mutation is in-flight", async () => {
    gqlMutate.mockReturnValue(new Promise(() => {}));
    renderForm();

    fireEvent.change(screen.getByLabelText("Company name *"), {
      target: { value: "Acme" },
    });
    fireEvent.click(screen.getByText("Create client"));

    expect(
      await screen.findByRole("button", { name: "Creating…" }),
    ).toBeDisabled();
  });

  it("shows Legal name and VAT number fields in company mode", () => {
    renderForm();
    expect(screen.getByLabelText("Legal name")).toBeInTheDocument();
    expect(screen.getByLabelText("VAT number")).toBeInTheDocument();
  });

  it("shows Company email and Company phone labels in company mode", () => {
    renderForm();
    expect(screen.getByLabelText("Company email")).toBeInTheDocument();
    expect(screen.getByLabelText("Company phone")).toBeInTheDocument();
  });

  it("shows Email and Phone labels (without 'Company') in individual mode", () => {
    renderForm();
    const trigger = screen.getByText("Individual");
    fireEvent.mouseDown(trigger);
    trigger.focus();
    fireEvent.click(trigger);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone")).toBeInTheDocument();
  });

  it("renders a Website input", () => {
    renderForm();
    expect(screen.getByLabelText("Website")).toBeInTheDocument();
  });

  it("shows the Industry dropdown", () => {
    renderForm();
    expect(screen.getByLabelText("Industry")).toBeInTheDocument();
  });

  it("shows address fields", () => {
    renderForm();
    expect(screen.getByLabelText("Address")).toBeInTheDocument();
    expect(screen.getByLabelText("City")).toBeInTheDocument();
    expect(screen.getByLabelText("Postal code")).toBeInTheDocument();
    expect(screen.getByLabelText("Country")).toBeInTheDocument();
  });

  it("shows billing fields", () => {
    renderForm();
    expect(screen.getByLabelText("Payment delay (days)")).toBeInTheDocument();
    expect(screen.getByLabelText("Tax rate (%)")).toBeInTheDocument();
  });

  it("shows the Tags section label", () => {
    renderForm();
    expect(screen.getByText("Tags")).toBeInTheDocument();
  });

  it("shows Last name input in individual mode", () => {
    renderForm();
    const trigger = screen.getByText("Individual");
    fireEvent.mouseDown(trigger);
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByLabelText("Last name")).toBeInTheDocument();
  });

  it("submits with clientType INDIVIDUAL and firstName/lastName in individual mode", async () => {
    gqlMutate.mockResolvedValueOnce({
      createClient: { id: 10, name: "Jane Doe" },
    });
    const onClose = vi.fn();
    renderForm(onClose);

    const trigger = screen.getByText("Individual");
    fireEvent.mouseDown(trigger);
    trigger.focus();
    fireEvent.click(trigger);

    fireEvent.change(screen.getByLabelText("First name *"), {
      target: { value: "Jane" },
    });
    fireEvent.change(screen.getByLabelText("Last name"), {
      target: { value: "Doe" },
    });
    fireEvent.click(screen.getByText("Create client"));

    await waitFor(() => expect(gqlMutate).toHaveBeenCalled());
    expect(gqlMutate.mock.calls[0][1]).toMatchObject({
      input: { clientType: "INDIVIDUAL", firstName: "Jane", lastName: "Doe" },
    });
  });

  it("shows the note about adding contacts after creation", () => {
    renderForm();
    expect(
      screen.getByText(
        "Add contacts from the client detail page after creation.",
      ),
    ).toBeInTheDocument();
  });

  it("submits legalName, vatNumber, website, email, and phone from company fields", async () => {
    gqlMutate.mockResolvedValueOnce({ createClient: { id: 9, name: "Acme" } });
    renderForm();

    fireEvent.change(screen.getByLabelText("Company name *"), {
      target: { value: "Acme" },
    });
    fireEvent.change(screen.getByLabelText("Legal name"), {
      target: { value: "Acme Limited" },
    });
    fireEvent.change(screen.getByLabelText("VAT number"), {
      target: { value: "FR00123456789" },
    });
    fireEvent.change(screen.getByLabelText("Website"), {
      target: { value: "https://acme.com" },
    });
    fireEvent.change(screen.getByLabelText("Company email"), {
      target: { value: "billing@acme.com" },
    });
    fireEvent.change(screen.getByLabelText("Company phone"), {
      target: { value: "+33100000000" },
    });
    fireEvent.click(screen.getByText("Create client"));

    await waitFor(() => expect(gqlMutate).toHaveBeenCalled());
    expect(gqlMutate.mock.calls[0][1]).toMatchObject({
      input: {
        name: "Acme",
        legalName: "Acme Limited",
        vatNumber: "FR00123456789",
        website: "https://acme.com",
        email: "billing@acme.com",
        phone: "+33100000000",
      },
    });
  });

  it("wires tag chip add/remove to the tagIds state", () => {
    renderForm();
    expect(tagChipsProps.tagIds).toEqual([]);

    act(() => (tagChipsProps.onAdd as (id: number) => void)(3));
    act(() => (tagChipsProps.onAdd as (id: number) => void)(4));
    act(() => (tagChipsProps.onRemove as (id: number) => void)(3));

    expect(tagChipsProps.tagIds).toEqual([4]);
  });
});
