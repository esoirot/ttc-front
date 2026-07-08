import type { GoogleCalendarEvent } from "@/types/google-calendar.types";

function formatEventTime(event: GoogleCalendarEvent): string {
  if (event.start.date) return "All day";
  if (event.start.dateTime) {
    return new Date(event.start.dateTime).toLocaleTimeString(undefined, {
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
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground">
        {selectedDate.toLocaleDateString(undefined, {
          weekday: "long",
          month: "short",
          day: "numeric",
        })}
      </p>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No events</p>
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
                {formatEventTime(event)}
              </span>
              <span className="text-foreground truncate">
                {event.summary ?? "(no title)"}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
