import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/test/queryClientWrapper";
import { messages } from "@/i18n/messages";
import { CLIENTS_QUERY, CLIENT_QUERY } from "@/graphql/clients.operations";

const { gqlFetch } = vi.hoisted(() => ({ gqlFetch: vi.fn() }));
vi.mock("@/lib/apollo", () => ({ gqlFetch }));

import { ClientPicker } from "./ClientPicker";

function wrapper({ children }: { children: ReactNode }) {
  const QueryWrapper = createQueryWrapper();
  return (
    <IntlProvider locale="en" messages={messages.en}>
      <QueryWrapper>{children}</QueryWrapper>
    </IntlProvider>
  );
}

const firstPage = [
  { id: 1, name: "Acme" },
  { id: 2, name: "Beta" },
];
const zeta = { id: 1450, name: "Zeta Corp" };

beforeEach(() => {
  gqlFetch.mockReset();
  gqlFetch.mockImplementation(
    (query: unknown, vars: { search?: string; id?: number }) => {
      if (query === CLIENT_QUERY)
        return Promise.resolve({ client: vars.id === zeta.id ? zeta : null });
      if (query === CLIENTS_QUERY) {
        const items = vars.search ? [zeta] : firstPage;
        return Promise.resolve({
          clients: { items, nextCursor: null, total: items.length },
        });
      }
      throw new Error("unexpected query");
    },
  );
});

function renderPicker(value = "", onChange = vi.fn()) {
  render(
    <ClientPicker value={value} onChange={onChange} placeholder="No client" />,
    { wrapper },
  );
  return onChange;
}

describe("ClientPicker", () => {
  it("shows the saved client's name even when it is not on the first page", async () => {
    renderPicker("1450");
    await waitFor(() =>
      expect(screen.getByRole("combobox")).toHaveTextContent("Zeta Corp"),
    );
  });

  it("does not load the list until opened", () => {
    renderPicker();
    expect(gqlFetch).not.toHaveBeenCalled();
  });

  it("lists the first clients when opened", async () => {
    renderPicker();
    fireEvent.click(screen.getByRole("combobox"));
    expect(
      await screen.findByRole("option", { name: "Acme" }),
    ).toBeInTheDocument();
  });

  it("does not search the server for blank space", async () => {
    renderPicker();
    fireEvent.click(screen.getByRole("combobox"));
    await screen.findByRole("option", { name: "Acme" });
    fireEvent.change(screen.getByPlaceholderText("Search…"), {
      target: { value: "   " },
    });
    await new Promise((r) => setTimeout(r, 350));

    expect(screen.getByRole("option", { name: "Acme" })).toBeInTheDocument();
    expect(gqlFetch).not.toHaveBeenCalledWith(
      CLIENTS_QUERY,
      expect.objectContaining({ search: expect.anything() }),
    );
  });

  it("starts with an empty search box each time it opens", async () => {
    renderPicker();
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.change(screen.getByPlaceholderText("Search…"), {
      target: { value: "Zeta" },
    });
    fireEvent.keyDown(screen.getByPlaceholderText("Search…"), {
      key: "Escape",
    });
    fireEvent.click(screen.getByRole("combobox"));

    expect(await screen.findByPlaceholderText("Search…")).toHaveValue("");
  });

  it("searches every client on the server and lets you pick one", async () => {
    const onChange = renderPicker();
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.change(screen.getByPlaceholderText("Search…"), {
      target: { value: "Zeta" },
    });
    fireEvent.click(await screen.findByRole("option", { name: "Zeta Corp" }));

    expect(gqlFetch).toHaveBeenCalledWith(
      CLIENTS_QUERY,
      expect.objectContaining({ search: "Zeta" }),
    );
    expect(onChange).toHaveBeenCalledWith("1450", "Zeta Corp");
  });
});
