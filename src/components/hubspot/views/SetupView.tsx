import { useIntl } from "react-intl";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/constants/hubspot";
import { redirectTo } from "@/lib/navigation";

export function SetupView() {
  const intl = useIntl();
  return (
    <div className="flex flex-col items-center gap-6 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-3xl" aria-hidden="true">
          🔗
        </span>
        <h2 className="text-lg font-semibold">
          {intl.formatMessage({
            id: "hubspot.setupView.title",
            defaultMessage: "Connect HubSpot",
          })}
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          {intl.formatMessage({
            id: "hubspot.setupView.description",
            defaultMessage:
              "Authenticate with your HubSpot account to manage contacts, companies, and deals.",
          })}
        </p>
      </div>
      <Button
        type="button"
        onClick={() => {
          redirectTo(`${API_BASE}/hubspot/auth`);
        }}
      >
        {intl.formatMessage({
          id: "hubspot.setupView.connectHubspot",
          defaultMessage: "Connect HubSpot",
        })}
      </Button>
    </div>
  );
}
