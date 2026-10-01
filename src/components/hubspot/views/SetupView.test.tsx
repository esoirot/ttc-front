import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirectTo } = vi.hoisted(() => ({ redirectTo: vi.fn() }));
vi.mock("@/lib/navigation", () => ({ redirectTo }));
import { createIntlWrapper } from "@/test/intlWrapper";
import { SetupView } from "./SetupView";

const wrapper = createIntlWrapper();

describe("SetupView", () => {
  beforeEach(() => {
    redirectTo.mockClear();
  });

  it("renders the connect heading and button", () => {
    render(<SetupView />, { wrapper });
    expect(
      screen.getByRole("heading", { name: "Connect HubSpot" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Connect HubSpot" }),
    ).toBeInTheDocument();
  });

  it("navigates to the hubspot auth endpoint on click", () => {
    render(<SetupView />, { wrapper });
    fireEvent.click(screen.getByRole("button", { name: "Connect HubSpot" }));
    expect(redirectTo).toHaveBeenCalledWith(
      expect.stringContaining("/hubspot/auth"),
    );
  });

  it("renders French copy when locale is fr", () => {
    render(<SetupView />, { wrapper: createIntlWrapper("fr") });
    expect(
      screen.getByRole("heading", { name: "Connecter HubSpot" }),
    ).toBeInTheDocument();
  });

  it("falls back to its built-in English copy when translations are missing", () => {
    render(
      <IntlProvider locale="en" messages={{}} onError={() => {}}>
        <SetupView />
      </IntlProvider>,
    );
    expect(
      screen.getByRole("heading", { name: "Connect HubSpot" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Authenticate with your HubSpot account to manage contacts, companies, and deals.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Connect HubSpot" }),
    ).toBeInTheDocument();
  });
});
