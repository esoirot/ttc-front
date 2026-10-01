import { FormattedMessage } from "react-intl";
import { Button } from "@/components/ui/button";
import { GOOGLE_CALENDAR_AUTH_URL } from "@/constants/googleCalendar";
import { redirectTo } from "@/lib/navigation";

export function SetupView() {
  return (
    <div className="flex flex-col items-center gap-6 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-3xl" aria-hidden="true">
          📅
        </span>
        <h2 className="text-lg font-semibold">
          <FormattedMessage
            id="googleCalendar.setupView.title"
            defaultMessage="Connect Google Calendar"
          />
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          <FormattedMessage
            id="googleCalendar.setupView.description"
            defaultMessage="Authenticate with your Google account to see your events on the dashboard and create new ones."
          />
        </p>
      </div>
      <Button
        type="button"
        onClick={() => {
          redirectTo(GOOGLE_CALENDAR_AUTH_URL);
        }}
      >
        <FormattedMessage
          id="googleCalendar.setupView.cta"
          defaultMessage="Connect Google Calendar"
        />
      </Button>
    </div>
  );
}
