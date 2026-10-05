import { useIntl } from "react-intl";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MonthSelectorProps } from "@/types/projects.types";

// Months counted from year 0, so month comparisons are plain integer ones.
function toIndex(d: Date): number {
  return d.getFullYear() * 12 + d.getMonth();
}

function fromIndex(i: number): Date {
  return new Date(Math.floor(i / 12), i % 12, 1);
}

export function MonthSelector({
  month,
  onChange,
  min,
  max,
}: MonthSelectorProps) {
  const intl = useIntl();
  const current = toIndex(month);
  const first = toIndex(min);
  const last = toIndex(max);
  const year = month.getFullYear();

  function select(index: number) {
    onChange(fromIndex(Math.min(last, Math.max(first, index))));
  }

  const years: number[] = [];
  for (let y = min.getFullYear(); y <= max.getFullYear(); y++) years.push(y);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon-sm"
        aria-label={intl.formatMessage({
          id: "projects.monthSelector.previous",
          defaultMessage: "Previous month",
        })}
        disabled={current <= first}
        onClick={() => select(current - 1)}
      >
        <ChevronLeftIcon />
      </Button>
      <Select
        value={String(month.getMonth())}
        onValueChange={(m) => select(year * 12 + Number(m))}
      >
        <SelectTrigger
          size="sm"
          className="w-36"
          aria-label={intl.formatMessage({
            id: "projects.monthSelector.month",
            defaultMessage: "Month",
          })}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, m) => (
            <SelectItem
              key={m}
              value={String(m)}
              disabled={year * 12 + m < first || year * 12 + m > last}
            >
              {intl.formatDate(new Date(2000, m, 1), { month: "long" })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={String(year)}
        onValueChange={(y) => select(Number(y) * 12 + month.getMonth())}
      >
        <SelectTrigger
          size="sm"
          className="w-24"
          aria-label={intl.formatMessage({
            id: "projects.monthSelector.year",
            defaultMessage: "Year",
          })}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label={intl.formatMessage({
          id: "projects.monthSelector.next",
          defaultMessage: "Next month",
        })}
        disabled={current >= last}
        onClick={() => select(current + 1)}
      >
        <ChevronRightIcon />
      </Button>
    </div>
  );
}
