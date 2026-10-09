import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createIntlWrapper } from "@/test/intlWrapper";
import type { CompanyContact } from "@/types/clients.types";
import { ContactsTab } from "./ContactsTab";

const wrapper = createIntlWrapper();

function makeContact(overrides: Partial<CompanyContact> = {}): CompanyContact {
  return {
    id: 1,
    clientId: 1,
    firstName: "Jane",
    lastName: "Doe",
    email: null,
    phone: null,
    jobTitle: null,
    color: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("ContactsTab", () => {
  it("shows an empty state when there are no contacts and the form is closed", () => {
    render(
      <ContactsTab
        contacts={[]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onAdd={vi.fn()}
      />,
      { wrapper },
    );

    expect(screen.getByText("No contacts yet.")).toBeInTheDocument();
  });

  it("renders a row per contact", () => {
    render(
      <ContactsTab
        contacts={[
          makeContact({ id: 1 }),
          makeContact({ id: 2, firstName: "Bob" }),
        ]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onAdd={vi.fn()}
      />,
      { wrapper },
    );

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Bob Doe")).toBeInTheDocument();
  });

  it("opens and cancels the add-contact form", () => {
    render(
      <ContactsTab
        contacts={[]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onAdd={vi.fn()}
      />,
      { wrapper },
    );

    fireEvent.click(screen.getByText("+ Add contact"));
    expect(screen.getByLabelText("First name")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByLabelText("First name")).not.toBeInTheDocument();
  });

  it("does not submit a fully blank contact form", async () => {
    const onAdd = vi.fn();
    render(
      <ContactsTab
        contacts={[]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onAdd={onAdd}
      />,
      { wrapper },
    );

    fireEvent.click(screen.getByText("+ Add contact"));
    fireEvent.click(screen.getByText("Add contact"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("submits the new contact and closes the form", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(
      <ContactsTab
        contacts={[]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onAdd={onAdd}
      />,
      { wrapper },
    );

    fireEvent.click(screen.getByText("+ Add contact"));
    fireEvent.change(screen.getByLabelText("First name"), {
      target: { value: "Janet" },
    });
    fireEvent.click(screen.getByText("Add contact"));

    await waitFor(() =>
      expect(onAdd).toHaveBeenCalledWith({
        firstName: "Janet",
        lastName: undefined,
        email: undefined,
        phone: undefined,
      }),
    );
    await waitFor(() =>
      expect(screen.queryByLabelText("First name")).not.toBeInTheDocument(),
    );
  });

  it("shows Job title and Color fields in the add-contact form", () => {
    render(
      <ContactsTab
        contacts={[]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onAdd={vi.fn()}
      />,
      { wrapper },
    );

    fireEvent.click(screen.getByText("+ Add contact"));
    expect(screen.getByLabelText("Job title")).toBeInTheDocument();
    expect(screen.getByLabelText("Color")).toBeInTheDocument();
  });

  it("submits jobTitle and color from the add-contact form", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(
      <ContactsTab
        contacts={[]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onAdd={onAdd}
      />,
      { wrapper },
    );

    fireEvent.click(screen.getByText("+ Add contact"));
    fireEvent.change(screen.getByLabelText("Job title"), {
      target: { value: "Vendor Manager" },
    });
    fireEvent.change(screen.getByLabelText("Color"), {
      target: { value: "#FCA5A5" },
    });
    fireEvent.click(screen.getByText("Add contact"));

    await waitFor(() =>
      expect(onAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          jobTitle: "Vendor Manager",
          color: "#FCA5A5",
        }),
      ),
    );
  });

  it("complains about a bad LinkedIn URL only once the field is left, and not after a successful add", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(
      <ContactsTab
        contacts={[]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onAdd={onAdd}
      />,
      { wrapper },
    );
    fireEvent.click(screen.getByText("+ Add contact"));
    const input = screen.getByLabelText("LinkedIn");

    fireEvent.change(input, { target: { value: "not a link" } });
    expect(screen.queryByText("Enter a valid URL.")).toBeNull();
    fireEvent.blur(input);
    expect(screen.getByText("Enter a valid URL.")).toBeInTheDocument();

    fireEvent.change(input, {
      target: { value: "https://www.linkedin.com/in/j" },
    });
    fireEvent.click(screen.getByText("Add contact"));
    await waitFor(() => expect(onAdd).toHaveBeenCalled());
    fireEvent.click(screen.getByText("+ Add contact"));
    fireEvent.change(screen.getByLabelText("LinkedIn"), {
      target: { value: "still not a link" },
    });
    expect(screen.queryByText("Enter a valid URL.")).toBeNull();
  });

  it("adds a contact with a LinkedIn URL, refusing one that isn't a web address", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(
      <ContactsTab
        contacts={[]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onAdd={onAdd}
      />,
      { wrapper },
    );

    fireEvent.click(screen.getByText("+ Add contact"));
    fireEvent.change(screen.getByLabelText("First name"), {
      target: { value: "Jane" },
    });
    const linkedin = screen.getByLabelText("LinkedIn");
    fireEvent.change(linkedin, { target: { value: "jane on linkedin" } });
    fireEvent.click(screen.getByText("Add contact"));
    expect(await screen.findByText("Enter a valid URL.")).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();

    fireEvent.change(linkedin, {
      target: { value: "https://www.linkedin.com/in/jane" },
    });
    fireEvent.click(screen.getByText("Add contact"));
    await waitFor(() =>
      expect(onAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          linkedinUrl: "https://www.linkedin.com/in/jane",
        }),
      ),
    );
  });

  it("calls onDelete when a contact row's delete is confirmed", () => {
    const onDelete = vi.fn();
    render(
      <ContactsTab
        contacts={[makeContact({ id: 9 })]}
        onDelete={onDelete}
        onEdit={vi.fn()}
        onAdd={vi.fn()}
      />,
      { wrapper },
    );

    fireEvent.click(screen.getByText("✕"));
    fireEvent.click(screen.getByText("Delete"));

    expect(onDelete).toHaveBeenCalledWith(9);
  });

  it("renders French copy for the translated ContactRow child when locale is fr", () => {
    render(
      <ContactsTab
        contacts={[makeContact({ id: 1 })]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onAdd={vi.fn()}
      />,
      { wrapper: createIntlWrapper("fr") },
    );

    fireEvent.click(screen.getByText("✎"));
    expect(screen.getByLabelText("Prénom")).toBeInTheDocument();
  });

  it("renders French copy for the ContactsTab's own strings when locale is fr", () => {
    render(
      <ContactsTab
        contacts={[]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onAdd={vi.fn()}
      />,
      { wrapper: createIntlWrapper("fr") },
    );

    expect(
      screen.getByText("Aucun contact pour l'instant."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("+ Ajouter un contact"));
    expect(screen.getByLabelText("Poste")).toBeInTheDocument();
  });
});
