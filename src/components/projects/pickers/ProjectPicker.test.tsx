import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/test/queryClientWrapper";
import { messages } from "@/i18n/messages";
import { PROJECTS_QUERY, PROJECT_QUERY } from "@/graphql/projects.operations";

const { gqlFetch } = vi.hoisted(() => ({ gqlFetch: vi.fn() }));
vi.mock("@/lib/apollo", () => ({ gqlFetch }));

import { ProjectPicker } from "./ProjectPicker";

function wrapper({ children }: { children: ReactNode }) {
  const QueryWrapper = createQueryWrapper();
  return (
    <IntlProvider locale="en" messages={messages.en}>
      <QueryWrapper>{children}</QueryWrapper>
    </IntlProvider>
  );
}

const far = { id: 1200, title: "Novel translation" };

beforeEach(() => {
  gqlFetch.mockReset();
  gqlFetch.mockImplementation(
    (query: unknown, vars: { search?: string; id?: number }) => {
      if (query === PROJECT_QUERY)
        return Promise.resolve({ project: vars.id === far.id ? far : null });
      if (query === PROJECTS_QUERY) {
        const items = vars.search ? [far] : [{ id: 1, title: "Brochure" }];
        return Promise.resolve({
          projects: { items, nextCursor: null, total: items.length },
        });
      }
      throw new Error("unexpected query");
    },
  );
});

describe("ProjectPicker", () => {
  it("shows the saved project's title even when it is not on the first page", async () => {
    render(
      <ProjectPicker
        value="1200"
        onChange={vi.fn()}
        placeholder="No project"
      />,
      { wrapper },
    );
    await waitFor(() =>
      expect(screen.getByRole("combobox")).toHaveTextContent(
        "Novel translation",
      ),
    );
  });

  it("searches every project on the server and lets you pick one", async () => {
    const onChange = vi.fn();
    render(
      <ProjectPicker value="" onChange={onChange} placeholder="No project" />,
      { wrapper },
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(
      await screen.findByRole("option", { name: "Brochure" }),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Search…"), {
      target: { value: "novel" },
    });
    fireEvent.click(
      await screen.findByRole("option", { name: "Novel translation" }),
    );

    expect(gqlFetch).toHaveBeenCalledWith(
      PROJECTS_QUERY,
      expect.objectContaining({ search: "novel" }),
    );
    expect(onChange).toHaveBeenCalledWith("1200", "Novel translation");
  });
});
