import { useState } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import type { MessageDescriptor } from "react-intl";
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
import { toLocalIso } from "@/lib/time";

const TIME_OPTIONS: string[] = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

const RECURRING_OPTIONS: { value: string; labelMessage: MessageDescriptor }[] =
  [
    {
      value: "NEVER",
      labelMessage: {
        id: "projects.taskDatePicker.recurring.never",
        defaultMessage: "Never",
      },
    },
    {
      value: "DAILY",
      labelMessage: {
        id: "projects.taskDatePicker.recurring.daily",
        defaultMessage: "Daily",
      },
    },
    {
      value: "WEEKDAYS",
      labelMessage: {
        id: "projects.taskDatePicker.recurring.weekdays",
        defaultMessage: "Monday to Friday",
      },
    },
    {
      value: "WEEKLY",
      labelMessage: {
        id: "projects.taskDatePicker.recurring.weekly",
        defaultMessage: "Weekly",
      },
    },
    {
      value: "MONTHLY_ON_30TH",
      labelMessage: {
        id: "projects.taskDatePicker.recurring.monthlyOn30th",
        defaultMessage: "Monthly on the 30th",
      },
    },
    {
      value: "MONTHLY_LAST_THURSDAY",
      labelMessage: {
        id: "projects.taskDatePicker.recurring.monthlyLastThursday",
        defaultMessage: "Monthly on the last Thursday",
      },
    },
  ];

const REMINDER_OPTIONS: { value: string; labelMessage: MessageDescriptor }[] = [
  {
    value: "NONE",
    labelMessage: {
      id: "projects.taskDatePicker.reminder.none",
      defaultMessage: "None",
    },
  },
  {
    value: "AT_DUE",
    labelMessage: {
      id: "projects.taskDatePicker.reminder.atDue",
      defaultMessage: "At time of due date",
    },
  },
  {
    value: "BEFORE_5M",
    labelMessage: {
      id: "projects.taskDatePicker.reminder.before5m",
      defaultMessage: "5 minutes before",
    },
  },
  {
    value: "BEFORE_10M",
    labelMessage: {
      id: "projects.taskDatePicker.reminder.before10m",
      defaultMessage: "10 minutes before",
    },
  },
  {
    value: "BEFORE_15M",
    labelMessage: {
      id: "projects.taskDatePicker.reminder.before15m",
      defaultMessage: "15 minutes before",
    },
  },
  {
    value: "BEFORE_30M",
    labelMessage: {
      id: "projects.taskDatePicker.reminder.before30m",
      defaultMessage: "30 minutes before",
    },
  },
  {
    value: "BEFORE_1H",
    labelMessage: {
      id: "projects.taskDatePicker.reminder.before1h",
      defaultMessage: "1 hour before",
    },
  },
  {
    value: "BEFORE_2H",
    labelMessage: {
      id: "projects.taskDatePicker.reminder.before2h",
      defaultMessage: "2 hours before",
    },
  },
  {
    value: "BEFORE_4H",
    labelMessage: {
      id: "projects.taskDatePicker.reminder.before4h",
      defaultMessage: "4 hours before",
    },
  },
  {
    value: "BEFORE_1D",
    labelMessage: {
      id: "projects.taskDatePicker.reminder.before1d",
      defaultMessage: "1 day before",
    },
  },
  {
    value: "BEFORE_2D",
    labelMessage: {
      id: "projects.taskDatePicker.reminder.before2d",
      defaultMessage: "2 days before",
    },
  },
  {
    value: "BEFORE_1W",
    labelMessage: {
      id: "projects.taskDatePicker.reminder.before1w",
      defaultMessage: "1 week before",
    },
  },
  {
    value: "BEFORE_2W",
    labelMessage: {
      id: "projects.taskDatePicker.reminder.before2w",
      defaultMessage: "2 weeks before",
    },
  },
];

function parseISO(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: "", time: "09:00" };
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-CA");
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
  open: openProp,
  onOpenChange,
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
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const intl = useIntl();
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChange ?? setOpenState;

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
        startEnabled && startDateVal
          ? toLocalIso(startDateVal, startTime)
          : null,
      dueDate:
        dueEnabled && dueDateVal ? toLocalIso(dueDateVal, dueTime) : null,
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
  const dateFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  } as const;
  const label = dueDate
    ? intl.formatDate(dueDate, dateFormatOptions)
    : startDate
      ? intl.formatDate(startDate, dateFormatOptions)
      : intl.formatMessage({
          id: "projects.taskDatePicker.noDate",
          defaultMessage: "No date",
        });

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs w-fit">
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
              <FormattedMessage
                id="projects.taskDatePicker.startDate"
                defaultMessage="Start Date"
              />
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
              <FormattedMessage
                id="projects.taskDatePicker.dueDate"
                defaultMessage="Due Date"
              />
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
          <Label className="text-xs font-medium">
            <FormattedMessage
              id="projects.taskDatePicker.recurringLabel"
              defaultMessage="Recurring"
            />
          </Label>
          <Select value={recurringVal} onValueChange={setRecurringVal}>
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RECURRING_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-xs">
                  {intl.formatMessage(o.labelMessage)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reminder */}
        <div className="flex flex-col gap-1">
          <Label className="text-xs font-medium">
            <FormattedMessage
              id="projects.taskDatePicker.reminderLabel"
              defaultMessage="Set due date reminder"
            />
          </Label>
          <Select value={reminderVal} onValueChange={setReminderVal}>
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REMINDER_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-xs">
                  {intl.formatMessage(o.labelMessage)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button size="sm" className="flex-1 h-7 text-xs" onClick={handleSave}>
            <FormattedMessage id="common.actions.save" defaultMessage="Save" />
          </Button>
          {hasAnyDate && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={handleRemove}
            >
              <FormattedMessage
                id="projects.taskDatePicker.remove"
                defaultMessage="Remove"
              />
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
