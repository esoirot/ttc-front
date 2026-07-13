import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CompanyContact } from "@/types/clients.types";
import { ContactsTab } from "./ContactsTab";

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

  it("calls onDelete when a contact row's delete is confirmed", () => {
    const onDelete = vi.fn();
    render(
      <ContactsTab
        contacts={[makeContact({ id: 9 })]}
        onDelete={onDelete}
        onEdit={vi.fn()}
        onAdd={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("✕"));
    fireEvent.click(screen.getByText("Delete"));

    expect(onDelete).toHaveBeenCalledWith(9);
  });
});
