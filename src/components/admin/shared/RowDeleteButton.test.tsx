import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RowDeleteButton } from "./RowDeleteButton";

describe("RowDeleteButton", () => {
  it("renders a trigger with aria-label Delete", () => {
    render(
      <RowDeleteButton
        onDelete={vi.fn()}
        title="Delete project?"
        description="This cannot be undone."
      />,
    );
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("calls onDelete once confirmed", () => {
    const onDelete = vi.fn();
    render(
      <RowDeleteButton
        onDelete={onDelete}
        title="Delete project?"
        description="This cannot be undone."
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).getByText("Delete project?")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("disables the trigger when disabled is true", () => {
    render(
      <RowDeleteButton
        onDelete={vi.fn()}
        title="Delete project?"
        description="This cannot be undone."
        disabled
      />,
    );
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
  });

  it("uses a custom aria-label when provided", () => {
    render(
      <RowDeleteButton
        onDelete={vi.fn()}
        title="Delete user?"
        description="This cannot be undone."
        ariaLabel="Delete user"
      />,
    );
    expect(
      screen.getByRole("button", { name: "Delete user" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete" }),
    ).not.toBeInTheDocument();
  });

  it("supports a custom description node", () => {
    render(
      <RowDeleteButton
        onDelete={vi.fn()}
        title="Delete user?"
        description={
          <>
            Delete <strong>jane@example.com</strong>? This cannot be undone.
          </>
        }
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });
});
