import { type RefObject, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const TIME_OPTIONS: string[] = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

const RECURRING_OPTIONS = [
  { value: "NEVER", label: "Never" },
  { value: "DAILY", label: "Daily" },
  { value: "WEEKDAYS", label: "Monday to Friday" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY_ON_30TH", label: "Monthly on the 30th" },
  { value: "MONTHLY_LAST_THURSDAY", label: "Monthly on the last Thursday" },
] as const;

const REMINDER_OPTIONS = [
  { value: "NONE", label: "None" },
  { value: "AT_DUE", label: "At time of due date" },
  { value: "BEFORE_5M", label: "5 minutes before" },
  { value: "BEFORE_10M", label: "10 minutes before" },
  { value: "BEFORE_15M", label: "15 minutes before" },
  { value: "BEFORE_30M", label: "30 minutes before" },
  { value: "BEFORE_1H", label: "1 hour before" },
  { value: "BEFORE_2H", label: "2 hours before" },
  { value: "BEFORE_4H", label: "4 hours before" },
  { value: "BEFORE_1D", label: "1 day before" },
  { value: "BEFORE_2D", label: "2 days before" },
  { value: "BEFORE_1W", label: "1 week before" },
  { value: "BEFORE_2W", label: "2 weeks before" },
] as const;

function parseISO(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: "", time: "09:00" };
  const d = new Date(iso);
  const date = d.toISOString().slice(0, 10);
  const h = String(d.getHours()).padStart(2, "0");
  const m = d.getMinutes() < 30 ? "00" : "30";
  return { date, time: `${h}:${m}` };
}

export function TaskDatePicker({
  startDate,
  dueDate,
  recurring,
  reminderOffset,
  onUpdate,
  triggerRef,
}: {
  startDate: string | null;
  dueDate: string | null;
  recurring: string | null;
  reminderOffset: string | null;
  onUpdate: (data: {
    startDate: string | null;
    dueDate: string | null;
    recurring: string | null;
    reminderOffset: string | null;
  }) => void;
  triggerRef?: RefObject<HTMLButtonElement>;
}) {
  const [open, setOpen] = useState(false);

  const parsedStart = parseISO(startDate);
  const parsedDue = parseISO(dueDate);

  const [startEnabled, setStartEnabled] = useState(!!startDate);
  const [startDateVal, setStartDateVal] = useState(parsedStart.date);
  const [startTime, setStartTime] = useState(parsedStart.time);
  const [dueEnabled, setDueEnabled] = useState(!!dueDate);
  const [dueDateVal, setDueDateVal] = useState(parsedDue.date);
  const [dueTime, setDueTime] = useState(parsedDue.time);
  const [recurringVal, setRecurringVal] = useState(recurring ?? "NEVER");
  const [reminderVal, setReminderVal] = useState(reminderOffset ?? "NONE");

  function handleOpen(o: boolean) {
    if (o) {
      const ps = parseISO(startDate);
      const pd = parseISO(dueDate);
      setStartEnabled(!!startDate);
      setStartDateVal(ps.date);
      setStartTime(ps.time);
      setDueEnabled(!!dueDate);
      setDueDateVal(pd.date);
      setDueTime(pd.time);
      setRecurringVal(recurring ?? "NEVER");
      setReminderVal(reminderOffset ?? "NONE");
    }
    setOpen(o);
  }

  function handleSave() {
    onUpdate({
      startDate:
        startEnabled && startDateVal ? `${startDateVal}T${startTime}:00` : null,
      dueDate: dueEnabled && dueDateVal ? `${dueDateVal}T${dueTime}:00` : null,
      recurring: recurringVal === "NEVER" ? null : recurringVal,
      reminderOffset: reminderVal === "NONE" ? null : reminderVal,
    });
    setOpen(false);
  }

  function handleRemove() {
    onUpdate({
      startDate: null,
      dueDate: null,
      recurring: null,
      reminderOffset: null,
    });
    setOpen(false);
  }

  const hasAnyDate = !!startDate || !!dueDate;
  const label = dueDate
    ? new Date(dueDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : startDate
      ? new Date(startDate).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "No date";

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          size="sm"
          className="h-7 text-xs w-fit"
        >
          📅 {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4 flex flex-col gap-3" align="start">
        {/* Start Date */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Checkbox
              id="start-enabled"
              checked={startEnabled}
              onCheckedChange={(c) => setStartEnabled(!!c)}
            />
            <Label
              htmlFor="start-enabled"
              className="text-xs font-medium cursor-pointer"
            >
              Start Date
            </Label>
          </div>
          {startEnabled && (
            <div className="flex gap-2 pl-6">
              <Input
                type="date"
                value={startDateVal}
                onChange={(e) => setStartDateVal(e.target.value)}
                className="h-7 text-xs flex-1"
              />
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-7 text-xs rounded-md border border-input bg-background px-2 w-20 shrink-0"
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Due Date */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Checkbox
              id="due-enabled"
              checked={dueEnabled}
              onCheckedChange={(c) => setDueEnabled(!!c)}
            />
            <Label
              htmlFor="due-enabled"
              className="text-xs font-medium cursor-pointer"
            >
              Due Date
            </Label>
          </div>
          {dueEnabled && (
            <div className="flex gap-2 pl-6">
              <Input
                type="date"
                value={dueDateVal}
                onChange={(e) => setDueDateVal(e.target.value)}
                className="h-7 text-xs flex-1"
              />
              <select
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="h-7 text-xs rounded-md border border-input bg-background px-2 w-20 shrink-0"
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Recurring */}
        <div className="flex flex-col gap-1">
          <Label className="text-xs font-medium">Recurring</Label>
          <Select value={recurringVal} onValueChange={setRecurringVal}>
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RECURRING_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-xs">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reminder */}
        <div className="flex flex-col gap-1">
          <Label className="text-xs font-medium">Set due date reminder</Label>
          <Select value={reminderVal} onValueChange={setReminderVal}>
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REMINDER_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-xs">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button size="sm" className="flex-1 h-7 text-xs" onClick={handleSave}>
            Save
          </Button>
          {hasAnyDate && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={handleRemove}
            >
              Remove
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
