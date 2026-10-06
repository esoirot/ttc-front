import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { createIntlWrapper } from "@/test/intlWrapper";
import type { SearchSelectProps } from "@/types/shared-ui.types";
import { SearchSelect } from "./SearchSelect";

const options = [
  { value: "1", label: "Acme" },
  { value: "2", label: "Zeta Corp" },
];

function Harness(props: Partial<SearchSelectProps>) {
  const [open, setOpen] = useState(props.open ?? false);
  const [search, setSearch] = useState("");
  return (
    <SearchSelect
      value=""
      options={options}
      placeholder="No client"
      onChange={vi.fn()}
      search={search}
      onSearchChange={setSearch}
      {...props}
      open={open}
      onOpenChange={setOpen}
    />
  );
}

function renderSelect(props: Partial<SearchSelectProps> = {}) {
  render(<Harness {...props} />, { wrapper: createIntlWrapper() });
}

function openPicker() {
  fireEvent.click(screen.getByRole("combobox"));
}

describe("SearchSelect", () => {
  it("shows the placeholder when nothing is selected", () => {
    renderSelect();
    expect(screen.getByRole("combobox")).toHaveTextContent("No client");
  });

  it("shows the selected option's name", () => {
    renderSelect({ value: "2" });
    expect(screen.getByRole("combobox")).toHaveTextContent("Zeta Corp");
  });

  it("shows the selection's name even when it is not among the options", () => {
    renderSelect({ value: "1450", selectedLabel: "Omega Ltd" });
    expect(screen.getByRole("combobox")).toHaveTextContent("Omega Ltd");
  });

  it("lists the options with a search box when opened", () => {
    renderSelect();
    openPicker();
    expect(screen.getByPlaceholderText("Search…")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Acme" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Zeta Corp" }),
    ).toBeInTheDocument();
  });

  it("reports what is typed in the search box", () => {
    const onSearchChange = vi.fn();
    renderSelect({ open: true, onSearchChange });
    fireEvent.change(screen.getByPlaceholderText("Search…"), {
      target: { value: "Zeta" },
    });
    expect(onSearchChange).toHaveBeenCalledWith("Zeta");
  });

  it("does not hide options itself, the search happens on the server", () => {
    renderSelect({ open: true, search: "nothing matches" });
    expect(screen.getByRole("option", { name: "Acme" })).toBeInTheDocument();
  });

  it("picking an option reports its value and name and closes", () => {
    const onChange = vi.fn();
    renderSelect({ onChange });
    openPicker();
    fireEvent.click(screen.getByRole("option", { name: "Zeta Corp" }));
    expect(onChange).toHaveBeenCalledWith("2", "Zeta Corp");
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("offers clearing the selection when a none label is given", () => {
    const onChange = vi.fn();
    renderSelect({ value: "1", noneLabel: "No client", onChange });
    openPicker();
    fireEvent.click(screen.getByRole("option", { name: "No client" }));
    expect(onChange).toHaveBeenCalledWith("", null);
  });

  it("has no clear option without a none label", () => {
    renderSelect({ open: true, placeholder: "Select project" });
    expect(
      screen.queryByRole("option", { name: "Select project" }),
    ).not.toBeInTheDocument();
  });

  it("marks the selected option", () => {
    renderSelect({ value: "2", open: true });
    expect(screen.getByRole("option", { name: "Zeta Corp" })).toHaveAttribute(
      "data-checked",
      "true",
    );
    expect(screen.getByRole("option", { name: "Acme" })).toHaveAttribute(
      "data-checked",
      "false",
    );
  });

  it("marks clearing as the current choice when nothing is selected", () => {
    renderSelect({ open: true, noneLabel: "No client" });
    expect(screen.getByRole("option", { name: "No client" })).toHaveAttribute(
      "data-checked",
      "true",
    );
  });

  it("says nothing matches instead of offering only the clear option", () => {
    renderSelect({ open: true, options: [], noneLabel: "No client" });
    expect(screen.getByText("No results.")).toBeInTheDocument();
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("says when nothing matches", () => {
    renderSelect({ open: true, options: [] });
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("says it is loading instead of no results while loading", () => {
    renderSelect({ open: true, options: [], loading: true });
    expect(screen.getByText("Loading…")).toBeInTheDocument();
    expect(screen.queryByText("No results.")).not.toBeInTheDocument();
  });
});
