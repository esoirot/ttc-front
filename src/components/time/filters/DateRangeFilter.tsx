import { useIntl } from "react-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDuration } from "@/lib/time";
import type { DateRangeFilterProps } from "@/types/time-entries.types";

export function DateRangeFilter({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  count,
  total,
  totalSeconds,
}: DateRangeFilterProps) {
  const intl = useIntl();
  return (
    <div className="flex gap-3 mb-4 items-center">
      <Label htmlFor="drf-start" className="text-sm shrink-0">
        {intl.formatMessage({
          id: "time.dateRangeFilter.from",
          defaultMessage: "From",
        })}
      </Label>
      <Input
        id="drf-start"
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        max={endDate}
        className="w-40"
      />
      <Label htmlFor="drf-end" className="text-sm shrink-0">
        {intl.formatMessage({
          id: "time.dateRangeFilter.to",
          defaultMessage: "To",
        })}
      </Label>
      <Input
        id="drf-end"
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        min={startDate}
        max={endDate}
        className="w-40"
      />
      <span className="ml-auto text-sm text-muted-foreground">
        {intl.formatMessage(
          {
            id: "time.dateRangeFilter.countSummary",
            defaultMessage: "{count} of {total} · {duration}",
          },
          { count, total, duration: formatDuration(totalSeconds) },
        )}
      </span>
    </div>
  );
}
