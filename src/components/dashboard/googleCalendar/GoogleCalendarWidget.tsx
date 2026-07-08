import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGoogleCalendarStatus,
  useGoogleCalendarEvents,
} from "@/hooks/integrations/useGoogleCalendar";
import { toDateKey } from "@/lib/calendarGrid";
import { MiniMonthGrid } from "./MiniMonthGrid";
import { AgendaList } from "./AgendaList";
import { CreateEventDialog } from "./CreateEventDialog";

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfNextMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

export function GoogleCalendarWidget() {
  const { data: status, isLoading: statusLoading } = useGoogleCalendarStatus();
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(new Date()),
  );
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const timeMin = startOfMonth(visibleMonth).toISOString();
  const timeMax = startOfNextMonth(visibleMonth).toISOString();
  const { data: eventList, isLoading: eventsLoading } = useGoogleCalendarEvents(
    timeMin,
    timeMax,
    !!status?.connected,
  );

  const events = eventList?.items ?? [];
  const selectedDateKey = toDateKey(selectedDate);
  const dayEvents = events.filter((event) => {
    const key =
      event.start.date ?? toDateKey(new Date(event.start.dateTime ?? ""));
    return key === selectedDateKey;
  });

  if (statusLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!status?.connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect Google Calendar to see your events here.{" "}
            <Link
              to="/google-calendar"
              className="text-primary hover:underline"
            >
              Connect
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Calendar</CardTitle>
        <CreateEventDialog defaultDate={selectedDate} />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <MiniMonthGrid
          visibleMonth={visibleMonth}
          onVisibleMonthChange={setVisibleMonth}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          events={events}
        />
        {eventsLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <AgendaList selectedDate={selectedDate} events={dayEvents} />
        )}
      </CardContent>
    </Card>
  );
}
