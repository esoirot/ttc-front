import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ChangeEvent, ReactNode } from "react";
import type { ClockifyProject } from "@/types/clockify.types";

// Radix Select doesn't open in jsdom; swap for native select to test prop-mapping logic
vi.mock("@/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange: (val: string) => void;
    children?: ReactNode;
  }) => (
    <select
      value={value}
      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
        onValueChange(e.target.value)
      }
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children?: ReactNode }) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: { children?: ReactNode }) => <>{children}</>,
  SelectItem: ({
    value,
    children,
  }: {
    value: string;
    children?: ReactNode;
  }) => <option value={value}>{children}</option>,
}));

import { ProjectSelect } from "./ProjectSelect";

function makeProject(
  overrides: Partial<ClockifyProject> = {},
): ClockifyProject {
  return {
    id: "p1",
    name: "Alpha Project",
    color: "#ff0000",
    archived: false,
    clientId: null,
    ...overrides,
  };
}

describe("ProjectSelect", () => {
  it("selects No project option when projectId is null", () => {
    render(<ProjectSelect projectId={null} projects={[]} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue("No project")).toBeInTheDocument();
  });

  it("selects the matching project name when projectId is set", () => {
    render(
      <ProjectSelect
        projectId="p1"
        projects={[makeProject({ id: "p1", name: "Alpha Project" })]}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByDisplayValue("Alpha Project")).toBeInTheDocument();
  });

  it("calls onChange with the project id when a project is selected", () => {
    const onChange = vi.fn();
    render(
      <ProjectSelect
        projectId={null}
        projects={[makeProject({ id: "p1", name: "Alpha Project" })]}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "p1" },
    });
    expect(onChange).toHaveBeenCalledWith("p1");
  });

  it("calls onChange with null when the No project option is selected", () => {
    const onChange = vi.fn();
    render(
      <ProjectSelect
        projectId="p1"
        projects={[makeProject({ id: "p1", name: "Alpha Project" })]}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "__none__" },
    });
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("renders one option per project plus the No project option", () => {
    render(
      <ProjectSelect
        projectId={null}
        projects={[
          makeProject({ id: "p1", name: "Alpha" }),
          makeProject({ id: "p2", name: "Beta" }),
        ]}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getAllByRole("option")).toHaveLength(3); // No project + Alpha + Beta
  });
});
