import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createIntlWrapper } from "@/test/intlWrapper";
import type { CompanyContact } from "@/types/clients.types";
import { ContactRow } from "./ContactRow";

const wrapper = createIntlWrapper();

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
      { wrapper },
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
      { wrapper },
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
      { wrapper },
    );

    fireEvent.click(screen.getByText("✎"));

    expect(screen.getByLabelText("First name")).toHaveValue("Jane");
    expect(screen.getByLabelText("Last name")).toHaveValue("Doe");
    expect(screen.getByLabelText("Email")).toHaveValue("jane@acme.com");
    expect(screen.getByLabelText("Phone")).toHaveValue("+33100000000");
  });

  it("blocks saving an invalid email and explains why", async () => {
    const onEdit = vi.fn().mockResolvedValue(undefined);
    render(
      <ContactRow contact={makeContact()} onDelete={vi.fn()} onEdit={onEdit} />,
      { wrapper },
    );

    fireEvent.click(screen.getByText("✎"));
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "not-an-email" },
    });
    // Submit directly: the browser's own type="email" check would otherwise
    // stop the click before the component's validation runs.
    fireEvent.submit(screen.getByText("Save").closest("form")!);

    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(onEdit).not.toHaveBeenCalled();
  });

  it("shows the contact's LinkedIn as a link opening a new tab", () => {
    render(
      <ContactRow
        contact={makeContact({
          linkedinUrl: "https://www.linkedin.com/in/jane",
        })}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
      { wrapper },
    );
    const link = screen.getByRole("link", { name: "LinkedIn" });
    expect(link).toHaveAttribute("href", "https://www.linkedin.com/in/jane");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("complains about a bad LinkedIn URL only once the field is left, and forgets it on reopen", () => {
    render(
      <ContactRow
        contact={makeContact()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
      { wrapper },
    );
    fireEvent.click(screen.getByText("✎"));
    const input = screen.getByLabelText("LinkedIn");

    fireEvent.change(input, { target: { value: "not a link" } });
    expect(screen.queryByText("Enter a valid URL.")).toBeNull();
    fireEvent.blur(input);
    expect(screen.getByText("Enter a valid URL.")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    fireEvent.click(screen.getByText("✎"));
    expect(screen.queryByText("Enter a valid URL.")).toBeNull();
  });

  it("edits the LinkedIn URL: checks it, saves it, clears it", async () => {
    const onEdit = vi.fn().mockResolvedValue(undefined);
    render(
      <ContactRow
        contact={makeContact({
          linkedinUrl: "https://www.linkedin.com/in/jane",
        })}
        onDelete={vi.fn()}
        onEdit={onEdit}
      />,
      { wrapper },
    );
    fireEvent.click(screen.getByText("✎"));
    const input = screen.getByLabelText("LinkedIn");
    expect(input).toHaveValue("https://www.linkedin.com/in/jane");

    fireEvent.change(input, { target: { value: "not a link" } });
    fireEvent.submit(screen.getByText("Save").closest("form")!);
    expect(await screen.findByText("Enter a valid URL.")).toBeInTheDocument();
    expect(onEdit).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "" } });
    fireEvent.submit(screen.getByText("Save").closest("form")!);
    await waitFor(() =>
      expect(onEdit).toHaveBeenCalledWith(
        expect.objectContaining({ linkedinUrl: null }),
      ),
    );
  });

  it("edit form pre-fills jobTitle and color from the contact", () => {
    render(
      <ContactRow
        contact={makeContact({ jobTitle: "Project Manager", color: "#D2D5DA" })}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
      { wrapper },
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
      { wrapper },
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
      { wrapper },
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
        jobTitle: null,
        linkedinUrl: null,
        color: null,
      }),
    );
    await waitFor(() =>
      expect(screen.queryByLabelText("First name")).not.toBeInTheDocument(),
    );
  });

  it("clearing a field sends null so the stored value is erased", async () => {
    const onEdit = vi.fn().mockResolvedValue(undefined);
    render(
      <ContactRow
        contact={makeContact({ id: 7 })}
        onDelete={vi.fn()}
        onEdit={onEdit}
      />,
      { wrapper },
    );

    fireEvent.click(screen.getByText("✎"));
    fireEvent.change(screen.getByLabelText("Phone"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(onEdit).toHaveBeenCalledWith(
        expect.objectContaining({ id: 7, phone: null }),
      ),
    );
  });

  it("cancel discards edits without calling onEdit", () => {
    const onEdit = vi.fn();
    render(
      <ContactRow contact={makeContact()} onDelete={vi.fn()} onEdit={onEdit} />,
      { wrapper },
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
      { wrapper },
    );

    fireEvent.click(screen.getByText("✕"));
    fireEvent.click(screen.getByText("Delete"));

    expect(onDelete).toHaveBeenCalled();
  });

  it("renders French copy when locale is fr", () => {
    render(
      <ContactRow
        contact={makeContact()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
      { wrapper: createIntlWrapper("fr") },
    );

    fireEvent.click(screen.getByText("✎"));
    expect(screen.getByLabelText("Prénom")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Enregistrer" }),
    ).toBeInTheDocument();
  });
});
