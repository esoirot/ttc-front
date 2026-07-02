import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Project } from "@/types/projects.types";
import { OverviewTab } from "./OverviewTab";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    userId: 1,
    clientId: null,
    title: "P",
    description: null,
    status: "ACTIVE",
    sourceLanguage: null,
    targetLanguage: null,
    wordCount: null,
    unitPrice: null,
    fixedFee: null,
    hourlyRate: null,
    perWordRate: null,
    currency: "EUR",
    deadline: null,
    startDate: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("OverviewTab", () => {
  it("always shows time logged, formatted", () => {
    render(
      <OverviewTab project={makeProject()} totalSeconds={3661} tasks={[]} />,
    );
    expect(screen.getByText("1:01:01")).toBeInTheDocument();
  });

  it("hides word count, unit price, and revenue cards when unset", () => {
    render(<OverviewTab project={makeProject()} totalSeconds={0} tasks={[]} />);
    expect(screen.queryByText("Word count")).not.toBeInTheDocument();
    expect(screen.queryByText("Unit price")).not.toBeInTheDocument();
    expect(screen.queryByText("Est. revenue")).not.toBeInTheDocument();
  });

  it("shows word count and unit price when set, and computes revenue", () => {
    render(
      <OverviewTab
        project={makeProject({
          wordCount: 1000,
          unitPrice: 0.1,
          currency: "USD",
        })}
        totalSeconds={0}
        tasks={[]}
      />,
    );
    expect(screen.getByText("1,000")).toBeInTheDocument();
    expect(screen.getByText("0.1 USD")).toBeInTheDocument();
    expect(screen.getByText("100.00 USD")).toBeInTheDocument();
  });
});
