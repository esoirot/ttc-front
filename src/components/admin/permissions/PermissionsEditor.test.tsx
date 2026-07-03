import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AdminPermission } from "@/types/users.types";
import { PermissionsEditor } from "./PermissionsEditor";

describe("PermissionsEditor", () => {
  it("renders a checkbox for each permission", () => {
    render(<PermissionsEditor value={[]} onChange={vi.fn()} />);
    expect(screen.getByText("MANAGE_USERS")).toBeInTheDocument();
    expect(screen.getByText("MANAGE_CLIENTS")).toBeInTheDocument();
    expect(screen.getByText("MANAGE_PROJECTS")).toBeInTheDocument();
    expect(screen.getByText("MANAGE_INVOICES")).toBeInTheDocument();
    expect(screen.getByText("MANAGE_TIME")).toBeInTheDocument();
    expect(screen.getByText("MANAGE_RATES")).toBeInTheDocument();
  });

  it("shows checked state for permissions already in value", () => {
    render(<PermissionsEditor value={["MANAGE_USERS"]} onChange={vi.fn()} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });

  it("adds a permission when its checkbox is checked", () => {
    const onChange = vi.fn();
    render(<PermissionsEditor value={[]} onChange={onChange} />);
    fireEvent.click(screen.getAllByRole("checkbox")[0]!);
    expect(onChange).toHaveBeenCalledWith(["MANAGE_USERS"]);
  });

  it("removes a permission when its checkbox is unchecked", () => {
    const onChange = vi.fn();
    const value: AdminPermission[] = ["MANAGE_USERS", "MANAGE_CLIENTS"];
    render(<PermissionsEditor value={value} onChange={onChange} />);
    fireEvent.click(screen.getAllByRole("checkbox")[0]!);
    expect(onChange).toHaveBeenCalledWith(["MANAGE_CLIENTS"]);
  });
});
