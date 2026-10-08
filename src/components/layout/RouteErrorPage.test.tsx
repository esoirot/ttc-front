import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { messages } from "@/i18n/messages";
import { RouteErrorPage } from "./RouteErrorPage";

function Boom(): never {
  throw new Error("render failed");
}

function renderCrash() {
  const router = createMemoryRouter(
    [
      {
        errorElement: <RouteErrorPage />,
        children: [
          { path: "/", element: <p>Dashboard</p> },
          { path: "/broken", element: <Boom /> },
        ],
      },
    ],
    { initialEntries: ["/broken"] },
  );
  render(
    <IntlProvider locale="en" messages={messages.en}>
      <RouterProvider router={router} />
    </IntlProvider>,
  );
  return router;
}

describe("RouteErrorPage", () => {
  // React logs the caught render error; keep the test output clean.
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows an error page instead of a blank screen when a page crashes", () => {
    renderCrash();
    expect(
      screen.getByRole("heading", { name: "Something went wrong" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reload" })).toBeInTheDocument();
  });

  it("reloads the current page (a full reload in the browser)", () => {
    const router = renderCrash();
    const navigate = vi.spyOn(router, "navigate");

    fireEvent.click(screen.getByRole("button", { name: "Reload" }));

    expect(navigate).toHaveBeenCalledWith(0);
  });

  it("goes back to the dashboard", async () => {
    const router = renderCrash();
    fireEvent.click(screen.getByRole("link", { name: "Back to dashboard" }));
    expect(router.state.location.pathname).toBe("/");
    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
  });
});
