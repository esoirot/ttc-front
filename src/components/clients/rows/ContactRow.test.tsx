import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CompanyContact } from "@/types/clients.types";
import { ContactRow } from "./ContactRow";

function makeContact(overrides: Partial<CompanyContact> = {}): CompanyContact {
  return {
    id: 1,
    clientId: 1,
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@acme.com",
    phone: "+33100000000",
    jobTitle: null,
    color: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("ContactRow", () => {
  it("renders the display name, email, and phone", () => {
    render(
      <ContactRow
        contact={makeContact()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@acme.com")).toBeInTheDocument();
    expect(screen.getByText("+33100000000")).toBeInTheDocument();
  });

  it("shows job title and color swatch in view mode when set", () => {
    render(
      <ContactRow
        contact={makeContact({ jobTitle: "Project Manager", color: "#D2D5DA" })}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByText("Project Manager")).toBeInTheDocument();
  });

  it("opens the inline edit form pre-filled from the contact", () => {
    render(
      <ContactRow
        contact={makeContact()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("✎"));

    expect(screen.getByLabelText("First name")).toHaveValue("Jane");
    expect(screen.getByLabelText("Last name")).toHaveValue("Doe");
  });

  it("edit form pre-fills jobTitle and color from the contact", () => {
    render(
      <ContactRow
        contact={makeContact({ jobTitle: "Project Manager", color: "#D2D5DA" })}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("✎"));

    expect(screen.getByLabelText("Job title")).toHaveValue("Project Manager");
    expect(screen.getByLabelText("Color")).toHaveValue("#D2D5DA");
  });

  it("saves edited jobTitle and color", async () => {
    const onEdit = vi.fn().mockResolvedValue(undefined);
    render(
      <ContactRow
        contact={makeContact({ id: 8 })}
        onDelete={vi.fn()}
        onEdit={onEdit}
      />,
    );

    fireEvent.click(screen.getByText("✎"));
    fireEvent.change(screen.getByLabelText("Job title"), {
      target: { value: "Vendor Manager" },
    });
    fireEvent.change(screen.getByLabelText("Color"), {
      target: { value: "#FCA5A5" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(onEdit).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 8,
          jobTitle: "Vendor Manager",
          color: "#FCA5A5",
        }),
      ),
    );
  });

  it("submits the edit form and closes it on save", async () => {
    const onEdit = vi.fn().mockResolvedValue(undefined);
    render(
      <ContactRow
        contact={makeContact({ id: 7 })}
        onDelete={vi.fn()}
        onEdit={onEdit}
      />,
    );

    fireEvent.click(screen.getByText("✎"));
    fireEvent.change(screen.getByLabelText("First name"), {
      target: { value: "Janet" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(onEdit).toHaveBeenCalledWith({
        id: 7,
        firstName: "Janet",
        lastName: "Doe",
        email: "jane@acme.com",
        phone: "+33100000000",
      }),
    );
    await waitFor(() =>
      expect(screen.queryByLabelText("First name")).not.toBeInTheDocument(),
    );
  });

  it("cancel discards edits without calling onEdit", () => {
    const onEdit = vi.fn();
    render(
      <ContactRow contact={makeContact()} onDelete={vi.fn()} onEdit={onEdit} />,
    );

    fireEvent.click(screen.getByText("✎"));
    fireEvent.change(screen.getByLabelText("First name"), {
      target: { value: "Changed" },
    });
    fireEvent.click(screen.getByText("Cancel"));

    expect(onEdit).not.toHaveBeenCalled();
    expect(screen.queryByLabelText("First name")).not.toBeInTheDocument();
  });

  it("calls onDelete after confirming the delete dialog", () => {
    const onDelete = vi.fn();
    render(
      <ContactRow
        contact={makeContact()}
        onDelete={onDelete}
        onEdit={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("✕"));
    fireEvent.click(screen.getByText("Delete"));

    expect(onDelete).toHaveBeenCalled();
  });
});
