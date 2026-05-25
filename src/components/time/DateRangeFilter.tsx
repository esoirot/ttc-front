import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DateRangeFilterProps } from "@/types/time-entries.types";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function DateRangeFilter({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  count,
  total,
  totalSeconds,
}: DateRangeFilterProps) {
  return (
    <div className="flex gap-3 mb-4 items-center">
      <Label htmlFor="drf-start" className="text-sm shrink-0">
        From
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
        To
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
        {count} of {total} · {formatDuration(totalSeconds)}
      </span>
    </div>
  );
}
