import { FormattedMessage, useIntl, type IntlShape } from "react-intl";
import type { GoogleCalendarEvent } from "@/types/google-calendar.types";

function formatEventTime(event: GoogleCalendarEvent, intl: IntlShape): string {
  if (event.start.date)
    return intl.formatMessage({
      id: "dashboard.agendaList.allDay",
      defaultMessage: "All day",
    });
  if (event.start.dateTime) {
    return intl.formatTime(new Date(event.start.dateTime), {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return "";
}

type Props = {
  selectedDate: Date;
  events: GoogleCalendarEvent[];
};

export function AgendaList({ selectedDate, events }: Props) {
  const intl = useIntl();
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground">
        {intl.formatDate(selectedDate, {
          weekday: "long",
          month: "short",
          day: "numeric",
        })}
      </p>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          <FormattedMessage
            id="dashboard.agendaList.noEvents"
            defaultMessage="No events"
          />
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {events.map((event) => (
            <a
              key={event.id}
              href={event.htmlLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-2 text-sm hover:opacity-80 transition-opacity no-underline"
            >
              <span className="text-xs text-muted-foreground shrink-0 w-14 pt-0.5">
                {formatEventTime(event, intl)}
              </span>
              <span className="text-foreground truncate">
                {event.summary ?? (
                  <FormattedMessage
                    id="dashboard.agendaList.noTitle"
                    defaultMessage="(no title)"
                  />
                )}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
