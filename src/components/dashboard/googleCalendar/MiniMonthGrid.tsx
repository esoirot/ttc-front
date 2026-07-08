import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildMonthMatrix, isSameDay, toDateKey } from "@/lib/calendarGrid";
import type { GoogleCalendarEvent } from "@/types/google-calendar.types";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function eventDateKey(event: GoogleCalendarEvent): string | null {
  if (event.start.date) return event.start.date;
  if (event.start.dateTime) return toDateKey(new Date(event.start.dateTime));
  return null;
}

type Props = {
  visibleMonth: Date;
  onVisibleMonthChange: (date: Date) => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  events: GoogleCalendarEvent[];
};

export function MiniMonthGrid({
  visibleMonth,
  onVisibleMonthChange,
  selectedDate,
  onSelectDate,
  events,
}: Props) {
  const today = new Date();
  const weeks = buildMonthMatrix(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth(),
  );
  const eventDays = new Set(
    events.map(eventDateKey).filter((key): key is string => key !== null),
  );

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between px-1 pb-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Previous month"
          onClick={() =>
            onVisibleMonthChange(
              new Date(
                visibleMonth.getFullYear(),
                visibleMonth.getMonth() - 1,
                1,
              ),
            )
          }
        >
          ‹
        </Button>
        <span className="text-sm font-medium">
          {visibleMonth.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
          })}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Next month"
          onClick={() =>
            onVisibleMonthChange(
              new Date(
                visibleMonth.getFullYear(),
                visibleMonth.getMonth() + 1,
                1,
              ),
            )
          }
        >
          ›
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="text-[11px] text-muted-foreground py-1">
            {label}
          </span>
        ))}
        {weeks.flat().map((date) => {
          const inMonth = date.getMonth() === visibleMonth.getMonth();
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, selectedDate);
          const hasEvents = eventDays.has(toDateKey(date));

          return (
            <div
              key={date.toISOString()}
              className="flex flex-col items-center"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onSelectDate(date)}
                className={cn(
                  "text-xs font-normal",
                  !inMonth && "text-muted-foreground/40",
                  isToday && !isSelected && "font-semibold",
                  isSelected &&
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                  !isSelected && isToday && "bg-accent",
                )}
              >
                {date.getDate()}
              </Button>
              <span
                className={cn(
                  "size-1 rounded-full mt-0.5",
                  hasEvents ? "bg-primary" : "bg-transparent",
                )}
                aria-hidden="true"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
