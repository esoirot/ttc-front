import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TimePageHeader } from "./TimePageHeader";

describe("TimePageHeader", () => {
  it("hides the Clockify import button when workspaceId is null", () => {
    render(
      <TimePageHeader
        workspaceId={null}
        showManual={false}
        showImport={false}
        onToggleManual={vi.fn()}
        onToggleImport={vi.fn()}
      />,
    );

    expect(screen.queryByText("Import from Clockify")).not.toBeInTheDocument();
    expect(screen.getByText("Log entry")).toBeInTheDocument();
  });

  it("shows the Clockify import button when workspaceId is set", () => {
    render(
      <TimePageHeader
        workspaceId="ws-1"
        showManual={false}
        showImport={false}
        onToggleManual={vi.fn()}
        onToggleImport={vi.fn()}
      />,
    );

    expect(screen.getByText("Import from Clockify")).toBeInTheDocument();
  });

  it("toggles import button label based on showImport", () => {
    render(
      <TimePageHeader
        workspaceId="ws-1"
        showManual={false}
        showImport={true}
        onToggleManual={vi.fn()}
        onToggleImport={vi.fn()}
      />,
    );

    expect(screen.getByText("Cancel import")).toBeInTheDocument();
  });

  it("toggles manual button label based on showManual", () => {
    render(
      <TimePageHeader
        workspaceId={null}
        showManual={true}
        showImport={false}
        onToggleManual={vi.fn()}
        onToggleImport={vi.fn()}
      />,
    );

    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("calls onToggleImport and onToggleManual on click", () => {
    const onToggleManual = vi.fn();
    const onToggleImport = vi.fn();
    render(
      <TimePageHeader
        workspaceId="ws-1"
        showManual={false}
        showImport={false}
        onToggleManual={onToggleManual}
        onToggleImport={onToggleImport}
      />,
    );

    fireEvent.click(screen.getByText("Import from Clockify"));
    fireEvent.click(screen.getByText("Log entry"));

    expect(onToggleImport).toHaveBeenCalled();
    expect(onToggleManual).toHaveBeenCalled();
  });
});
