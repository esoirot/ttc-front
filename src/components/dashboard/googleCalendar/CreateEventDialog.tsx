import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateGoogleCalendarEvent } from "@/hooks/integrations/useGoogleCalendar";

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type Props = {
  defaultDate: Date;
};

export function CreateEventDialog({ defaultDate }: Props) {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const createEvent = useCreateGoogleCalendarEvent();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      const initialStart = new Date(defaultDate);
      initialStart.setHours(9, 0, 0, 0);
      const initialEnd = new Date(initialStart.getTime() + 60 * 60 * 1000);
      setSummary("");
      setStart(toLocalInputValue(initialStart));
      setEnd(toLocalInputValue(initialEnd));
    }
  }

  function handleStartChange(value: string) {
    setStart(value);
    if (!value) return;
    const parsedStart = new Date(value);
    const currentEnd = end ? new Date(end) : null;
    if (!currentEnd || currentEnd <= parsedStart) {
      setEnd(
        toLocalInputValue(new Date(parsedStart.getTime() + 60 * 60 * 1000)),
      );
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!summary.trim() || !start || !end) return;
    await createEvent.mutateAsync({
      summary: summary.trim(),
      startDateTime: new Date(start).toISOString(),
      endDateTime: new Date(end).toISOString(),
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm">
          + Add event
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New event</DialogTitle>
          <DialogDescription>
            Creates an event on your primary Google Calendar.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1">
            <Label htmlFor="gcal-summary">Title</Label>
            <Input
              id="gcal-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="gcal-start">Start</Label>
            <Input
              id="gcal-start"
              type="datetime-local"
              value={start}
              onChange={(e) => handleStartChange(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="gcal-end">End</Label>
            <Input
              id="gcal-end"
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createEvent.isPending}>
              {createEvent.isPending ? "Creating…" : "Create event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
