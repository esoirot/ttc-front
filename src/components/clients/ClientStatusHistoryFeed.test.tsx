import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ClientStatusHistory } from "@/types/clients.types";
import { ClientStatusHistoryFeed } from "./ClientStatusHistoryFeed";

function makeEntry(
  overrides: Partial<ClientStatusHistory> = {},
): ClientStatusHistory {
  return {
    id: 1,
    clientId: 1,
    userId: 1,
    type: "STATUS_CHANGED",
    payload: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    user: { id: 1, name: "Alice" },
    ...overrides,
  };
}

describe("ClientStatusHistoryFeed", () => {
  it("shows an empty state when there is no history", () => {
    render(<ClientStatusHistoryFeed history={[]} />);
    expect(screen.getByText("No status history yet.")).toBeInTheDocument();
  });

  it("shows the user name and reverses order (newest first)", () => {
    render(
      <ClientStatusHistoryFeed
        history={[
          makeEntry({
            id: 1,
            type: "STATUS_CHANGED",
            payload: JSON.stringify({ from: "TO_CONTACT", to: "CONTACTED" }),
          }),
          makeEntry({
            id: 2,
            type: "CONTACTED_AT_CHANGED",
            payload: JSON.stringify({
              from: null,
              to: "2026-07-05T00:00:00.000Z",
            }),
          }),
        ]}
      />,
    );

    const items = screen.getAllByText(/Alice/);
    expect(items[0].closest("div")?.textContent).toContain(
      "set last contacted date",
    );
  });

  it("falls back to 'User <id>' when there is no user", () => {
    render(
      <ClientStatusHistoryFeed
        history={[makeEntry({ user: null, userId: 9 })]}
      />,
    );
    expect(screen.getByText("User 9")).toBeInTheDocument();
  });

  it.each([
    [
      "STATUS_CHANGED",
      JSON.stringify({ from: "TO_CONTACT", to: "CONTACTED" }),
      "changed status from Prospect to 1st Contact",
    ],
    [
      "CONTACTED_AT_CHANGED",
      JSON.stringify({ from: null, to: "2026-07-05T00:00:00.000Z" }),
      "set last contacted date to Jul 5, 2026",
    ],
    [
      "CONTACTED_AT_CHANGED",
      JSON.stringify({
        from: "2026-06-01T00:00:00.000Z",
        to: "2026-07-05T00:00:00.000Z",
      }),
      "changed last contacted date from Jun 1, 2026 to Jul 5, 2026",
    ],
    [
      "CONTACTED_AT_CHANGED",
      JSON.stringify({ from: "2026-06-01T00:00:00.000Z", to: null }),
      "cleared last contacted date",
    ],
  ] as const)("describes %s correctly", (type, payload, expected) => {
    render(
      <ClientStatusHistoryFeed history={[makeEntry({ type, payload })]} />,
    );
    expect(screen.getByText(expected, { exact: false })).toBeInTheDocument();
  });

  it("falls back to the raw type on unparseable JSON payload", () => {
    render(
      <ClientStatusHistoryFeed
        history={[makeEntry({ type: "STATUS_CHANGED", payload: "not-json{" })]}
      />,
    );
    expect(
      screen.getByText("STATUS_CHANGED", { exact: false }),
    ).toBeInTheDocument();
  });

  it("humanizes unknown history types", () => {
    render(
      <ClientStatusHistoryFeed
        history={[makeEntry({ type: "SOME_NEW_TYPE", payload: null })]}
      />,
    );
    expect(
      screen.getByText("some new type", { exact: false }),
    ).toBeInTheDocument();
  });

  it("shows the first letter of the user name as the avatar initial", () => {
    render(
      <ClientStatusHistoryFeed
        history={[makeEntry({ user: { id: 1, name: "Bob" } })]}
      />,
    );
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("shows '?' as avatar initial when the user name is null", () => {
    render(
      <ClientStatusHistoryFeed
        history={[makeEntry({ user: { id: 1, name: null } })]}
      />,
    );
    expect(screen.getByText("?")).toBeInTheDocument();
  });
});
