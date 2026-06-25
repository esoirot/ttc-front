import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Project } from "@/types/projects.types";
import { ProjectCard } from "./ProjectCard";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    userId: 1,
    clientId: null,
    title: "Translate manual",
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

describe("ProjectCard", () => {
  it("shows 'No client' when the project has no clientId", () => {
    render(
      <ProjectCard
        project={makeProject()}
        clientName={undefined}
        onDelete={vi.fn()}
        onClick={vi.fn()}
      />,
    );
    expect(screen.getByText(/No client/)).toBeInTheDocument();
  });

  it("shows the client name when linked", () => {
    render(
      <ProjectCard
        project={makeProject({ clientId: 1 })}
        clientName="Acme"
        onDelete={vi.fn()}
        onClick={vi.fn()}
      />,
    );
    expect(screen.getByText(/Acme/)).toBeInTheDocument();
  });

  it("shows the language pair and deadline when present", () => {
    render(
      <ProjectCard
        project={makeProject({
          sourceLanguage: "EN",
          targetLanguage: "FR",
          deadline: "2026-07-01T00:00:00.000Z",
        })}
        clientName={undefined}
        onDelete={vi.fn()}
        onClick={vi.fn()}
      />,
    );
    expect(screen.getByText(/EN→FR/)).toBeInTheDocument();
    expect(screen.getByText(/Due 2026-07-01/)).toBeInTheDocument();
  });

  it("calls onClick when the card is clicked", () => {
    const onClick = vi.fn();
    render(
      <ProjectCard
        project={makeProject()}
        clientName={undefined}
        onDelete={vi.fn()}
        onClick={onClick}
      />,
    );
    fireEvent.click(screen.getByText("Translate manual"));
    expect(onClick).toHaveBeenCalled();
  });

  it("calls onDelete with the project id after confirming, without triggering onClick", () => {
    const onDelete = vi.fn();
    const onClick = vi.fn();
    render(
      <ProjectCard
        project={makeProject({ id: 7 })}
        clientName={undefined}
        onDelete={onDelete}
        onClick={onClick}
      />,
    );

    fireEvent.click(screen.getByText("✕"));
    fireEvent.click(screen.getByText("Delete"));

    expect(onDelete).toHaveBeenCalledWith(7);
  });
});
